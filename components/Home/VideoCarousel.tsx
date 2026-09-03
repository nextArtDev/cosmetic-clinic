'use client'

import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import ReplayImg from '../../public/images/replay.svg'
import PlayImg from '../../public/images/play.svg'
import PauseImg from '../../public/images/pause.svg'
import { hightlightsSlides } from '@/constants'

gsap.registerPlugin(ScrollTrigger)

type ProcessType = 'video-end' | 'video-last' | 'video-reset' | 'pause' | 'play'

interface VideoProps {
  isEnd: boolean
  startPlay: boolean
  videoId: number
  isLastVideo: boolean
  isPlaying: boolean
}

const VideoCarousel = () => {
  const slideCount = hightlightsSlides.length

  const videoRef = useRef<(HTMLVideoElement | null)[]>([])
  const videoSpanRef = useRef<(HTMLSpanElement | null)[]>([])
  const videoDivRef = useRef<(HTMLDivElement | null)[]>([])

  const [video, setVideo] = useState<VideoProps>({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  })
  const [loadedIds, setLoadedIds] = useState<number[]>([])

  const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video

  useGSAP(() => {
    gsap.to('.video-slide', {
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: 'power2.inOut',
    })

    gsap.to(`#video-${videoId}`, {
      scrollTrigger: {
        trigger: `#video-${videoId}`,
        toggleActions: 'restart none none none',
      },
      onComplete: () => {
        setVideo((pre) => ({ ...pre, startPlay: true, isPlaying: true }))
      },
    })
  }, [isEnd, videoId])

  useEffect(() => {
    const span = videoSpanRef.current[videoId]
    const videoEl = videoRef.current[videoId]
    if (!span || !videoEl) return

    let currentProgress = 0

    const anim = gsap.to(span, {
      onUpdate: () => {
        const progress = Math.ceil(anim.progress() * 100)
        if (progress === currentProgress) return
        currentProgress = progress

        gsap.to(videoDivRef.current[videoId], {
          width: window.innerWidth < 1200 ? '10vw' : '4vw',
        })
        gsap.to(span, {
          width: `${currentProgress}%`,
          backgroundColor: 'white',
        })
      },
      onComplete: () => {
        if (isPlaying) {
          gsap.to(videoDivRef.current[videoId], { width: '12px' })
          gsap.to(span, { backgroundColor: '#afafaf' })
        }
      },
    })

    const animUpdate = () => {
      if (videoEl.duration) {
        anim.progress(videoEl.currentTime / videoEl.duration)
      }
    }

    if (isPlaying) {
      gsap.ticker.add(animUpdate)
    }

    return () => {
      gsap.ticker.remove(animUpdate)
      anim.kill()
    }
  }, [videoId, isPlaying])

  useEffect(() => {
    const videoEl = videoRef.current[videoId]
    if (!videoEl || !loadedIds.includes(videoId)) return

    if (isPlaying && startPlay) {
      videoEl.play().catch(() => {})
    } else {
      videoEl.pause()
    }
  }, [videoId, startPlay, isPlaying, loadedIds])

  const handleProcess = (type: ProcessType, i?: number) => {
    switch (type) {
      case 'video-end': {
        const nextId = (i ?? 0) + 1
        setVideo((pre) => ({
          ...pre,
          isEnd: true,
          videoId: nextId < slideCount ? nextId : 0,
        }))
        break
      }

      case 'video-last':
        setVideo((pre) => ({ ...pre, isLastVideo: true }))
        break

      case 'video-reset': {
        const firstVideo = videoRef.current[0]
        if (firstVideo) firstVideo.currentTime = 0
        setVideo((pre) => ({
          ...pre,
          isEnd: false,
          isLastVideo: false,
          videoId: 0,
          isPlaying: true,
          startPlay: true,
        }))
        break
      }

      case 'pause':
      case 'play':
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }))
        break

      default:
        break
    }
  }

  const handleLoadedMetadata = (i: number) => {
    setLoadedIds((prev) => (prev.includes(i) ? prev : [...prev, i]))
  }

  return (
    <article className="pb-8">
      <div className="flex items-center">
        {hightlightsSlides.map((list, i) => (
          <div
            key={list.id}
            id={`slider-${i}`}
            className="video-slide sm:pr-20 pr-6"
          >
            <div className="video-carousel_container">
              <div className="w-full flex-center rounded-2xl overflow-hidden !h-auto bg-gray-500/70 ml-4">
                <video
                  id={`video-${i}`}
                  playsInline
                  className={`${list.id === 2 ? 'translate-x-0' : ''} pointer-events-none`}
                  preload="auto"
                  muted
                  ref={(el) => {
                    videoRef.current[i] = el
                  }}
                  onEnded={() =>
                    i !== slideCount - 1
                      ? handleProcess('video-end', i)
                      : handleProcess('video-last')
                  }
                  onPlay={() =>
                    setVideo((pre) => ({ ...pre, isPlaying: true }))
                  }
                  onLoadedMetadata={() => handleLoadedMetadata(i)}
                >
                  <source src={list.video} type="video/mp4" />
                </video>
              </div>

              <div className="absolute top-12 left-[5%] z-10">
                {list.textLists.map((text, j) => (
                  <p key={j} className="md:text-2xl text-xl font-medium">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative flex-center md:mt-10">
        <div className="flex-center py-5 md:py-6 px-7 bg-gray-400 glass backdrop-blur rounded-full">
          {hightlightsSlides.map((_, i) => (
            <div
              key={i}
              className="overflow-hidden mx-2 w-3 h-3 bg-gray-500 rounded-full relative cursor-pointer"
              ref={(el) => {
                videoDivRef.current[i] = el
              }}
            >
              <span
                className="absolute h-full w-full rounded-full"
                ref={(el) => {
                  videoSpanRef.current[i] = el
                }}
              />
            </div>
          ))}
        </div>

        <button
          className="relative bg-gray-500 glass control-btn"
          onClick={
            isLastVideo
              ? () => handleProcess('video-reset')
              : () => handleProcess(isPlaying ? 'pause' : 'play')
          }
          aria-label={isLastVideo ? 'Replay' : isPlaying ? 'Pause' : 'Play'}
        >
          <Image
            src={isLastVideo ? ReplayImg : isPlaying ? PauseImg : PlayImg}
            alt=""
            width={24}
            height={24}
          />
        </button>
      </div>
    </article>
  )
}

export default VideoCarousel
