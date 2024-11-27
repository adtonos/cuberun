import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../state/useStore'

import closeButton from '../../textures/close.png'
import '../../styles/ad.css'
import placeholderVideo from '../../video/placeholder.mp4'
import placeholderImg from '../../video/placeholder.png'

import '@arte/videojs-vast';

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
  controls: true,
  bigPlayButton: false,
  controlBar: {
    playToggle: false,
    captionsButton: false,
    chaptersButton: false,
    subtitlesButton: false,
    remainingTimeDisplay: false,
    progressControl: {
      seekBar: true
    },
    fullscreenToggle: false,
    playbackRateMenuButton: false,
    pictureInPictureToggle: false,
    volumePanel: false,
    bigPlayButton: false,
  },
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
        playerRef.current.play();
        playerRef.current.controls(true);
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

    player.vast({
      vastUrl: `https://vast-adapter.adtonos.com/xml/83CMyMvzGSLQAj7mf/vast.xml?contentType=video&listenerId=${listenerId}`,
      debug: true,
    });

    player.on('adsready', (event) => {
      setReady(true);
    });

    player.on('vast.play', (event, data) => {
      setTimeout(() => {closeRef.current.style.opacity = 1}, 15000)
    });

    player.on('vast.complete', (event, data) => {
      window.location.reload();
    });

    player.on('waiting', () => {
      window.location.reload();
    });

    player.on('vast.error', (event) => {
      setReady(false);
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