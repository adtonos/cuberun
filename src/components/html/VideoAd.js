import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../state/useStore'
import { addEffect } from '@react-three/fiber'

import closeButton from '../../textures/close.png'
import '../../styles/ad.css'

import Plyr from "plyr-react"
import "plyr-react/plyr.css"

const controls = `
<div class="plyr__controls">
  <div class="plyr__controls__item plyr__progress__container">
    <div class="plyr__progress">
      <input data-plyr="seek" type="range" min="0" max="100" step="0.01" value="0" autocomplete="off" role="slider" aria-label="Seek">
    </div>
  </div>
</div>
`;

const plyrProps = {
  source: {
    type: 'video',
    title: 'AdTonos Ads',
    sources: [
      {
        src: 'https://files.adtonos.com/audio-in-video-demo-ad.mp4',
        type: 'video/mp4',
        size: 720,
      },
    ],
  },
  options: {
    autoplay: false,
    hideControls: false,
    controls,
  }
}

const VideoAd = () => {

  const [shown, setShown] = useState(true)

  const playingAds = useStore(s => s.playingAds)
  const enableMusic = useStore(s => s.enableMusic)
  const setGameOver = useStore(s => s.setGameOver)

  const playerRef = useRef()
  const closeRef = useRef()

  useEffect(() => {
    console.log("internal plyr instance:", playerRef.current.plyr)
  })

  let then = Date.now()

  useEffect(() => addEffect(() => {
    const now = Date.now()

    if (now - then > 100) { // throttle these to a max of 10 updates/sec
      if (closeRef.current && playerRef.current) {
        if (playerRef.current.plyr.currentTime > 10 && playerRef.current.plyr.currentTime < 10.75) {
          closeRef.current.style.opacity = (10 - playerRef.current.plyr.currentTime) * -1;
        }
      }
      // eslint-disable-next-line
      then = now
    }
  }))

  useEffect(() => {
    if (playingAds) {
      enableMusic(false)
      setGameOver(false);
      setShown(true)
      playerRef.current.plyr.play()
      playerRef.current.plyr.once('ended', (event) => {
        window.location.reload();
      });
    } else {
      setShown(false)
    }
  }, [playingAds, enableMusic, setGameOver])

  const handleClose = () => {
    window.location.reload();
  }

  return (
    <div className="game__container" style={{ display: shown ? 'block' : 'none' }}>
      <div className="ad__video">
        <Plyr ref={playerRef}{...plyrProps}  />
      </div>
      <div className="ad__banner">
        <img alt="banner" src="https://files.adtonos.com/campaign-banner-L4AkdLZur42SpBG2p8RZhb5dhKoNp2wq.png" />
      </div>
      <img className="ad__close" alt="close" src={closeButton} onClick={() => handleClose()} style={{ opacity: 0 }} ref={closeRef} />
    </div>
  )
}

export default VideoAd