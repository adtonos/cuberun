import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../state/useStore'

import closeButton from '../../textures/close.png'
import '../../styles/ad.css'
import placeholderVideo from '../../video/placeholder.mp4'
import placeholderImg from '../../video/placeholder.png'

import 'videojs-contrib-ads';
import 'videojs-ima';
import 'videojs-ima/dist/videojs.ima.css';

import VideoJS from './VideoJS'

async function getListenerId() {
  const url = "https://cookie.adtonos.com/opt/expose/ulid";
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.text();
    }
  } catch (error) { }
  return '';
}

const videoJsOptions = {
  debug: true,
  autoplay: false,
  controls: false,
  bigPlayButton: false,
  responsive: true,
  fluid: true,
  poster: placeholderImg,
  sources: [
    {
      src: placeholderVideo,
      type: 'video/mp4',
    }
  ],
  autoSetup: true,
};

const VideoAd = () => {
  const [shown, setShown] = useState(false)
  const [active, setActive] = useState(false)
  const [ready, setReady] = useState(false)
  const [listenerId, setListenerId] = useState('')

  const playingAds = useStore(s => s.playingAds)
  const prepareAds = useStore(s => s.prepareAds)
  const enableMusic = useStore(s => s.enableMusic)
  const setGameOver = useStore(s => s.setGameOver)

  const playerRef = useRef()
  const closeRef = useRef()

  useEffect(() => {
    if (prepareAds) {
      getListenerId().then(result => {
        setListenerId(result);
        setActive(true);
      });
    } else {
      setActive(false);
    }
  }, [prepareAds, active, listenerId])

  useEffect(() => {
    if (playingAds) {
      if (ready) {
        enableMusic(false)
        setGameOver(false);
        setShown(true)
        setTimeout(() => { playerRef.current.play() }, 100);
      } else {
        window.location.reload();
      }
    } else {
      setShown(false)
    }
  }, [playingAds, enableMusic, setGameOver, ready])

  const handleClose = () => {
    window.location.reload();
  }

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    player.ima({adTagUrl: `https://vast-adapter.adtonos.com/xml/83CMyMvzGSLQAj7mf/vast.xml?contentType=video&listenerId=${listenerId}`});

    player.on('ads-manager', (event) => {
      setReady(true);

      // eslint-disable-next-line no-undef
      event.adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
        window.location.reload();
      });
    });

    player.on('ads-ad-started', () => {
      setTimeout(() => {closeRef.current.style.opacity = 1}, 15000)
    });
  };

  return active ? (
    <div className="game__container" style={{ display: shown ? 'block' : 'none' }}>
      <div className="ad__video">
        <div className="ad__video_box">
          <VideoJS options={videoJsOptions} onReady={handlePlayerReady}/>
        </div>
      </div>
      <img className="ad__close" alt="close" src={closeButton} onClick={() => handleClose()} style={{ opacity: 0 }} ref={closeRef} />
    </div>
  ) : ''
}

export default VideoAd