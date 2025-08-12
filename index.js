const assets = [
  {
    thumbnail: './assets/1-thumbnail.webp',
    video: 'https://fast.wistia.com/embed/medias/9pksiy00y2.m3u8',
    title: 'Summer Splash 2024',
  },
  {
    thumbnail: './assets/2-thumbnail.webp',
    video: 'https://fast.wistia.com/embed/medias/ge0b2vp7bj.m3u8',
    title: 'Alberta',
  },
  {
    thumbnail: './assets/3-thumbnail.webp',
    video: ' https://fast.wistia.com/embed/medias/hnmi1zsgno.m3u8',
    title: 'Zipline',
  },
  {
    thumbnail: './assets/4-thumbnail.webp',
    video: 'https://fast.wistia.com/embed/medias/0qy7wtdh5b.m3u8',
    title: 'Xmas',
  },
  {
    thumbnail: './assets/5-thumbnail.webp',
    video: 'https://fast.wistia.com/embed/medias/zi96nwkvg4.m3u8',
    title: 'IRL Winter 2024',
  },
  {
    thumbnail: './assets/6-thumbnail.webp',
    video: 'https://fast.wistia.com/embed/medias/u3ip2er1pn.m3u8',
    title: 'Jenga challenge',
  },
  {
    thumbnail: './assets/7-thumbnail.webp',
    video: 'https://fast.wistia.com/embed/medias/kqvj42j1da.m3u8',
    title: 'Golf outing',
  },
]

assets.forEach((asset, index) => {
  const { thumbnail, title } = asset;
  const videoCardTemplate = document.querySelector('#video-card-template');
  const clonedTemplate = videoCardTemplate.content.cloneNode(true);
  const videoCard = clonedTemplate.querySelector('.video-card');
  videoCard.id = `video-card-${index}`;
  videoCard.querySelector('.thumbnail').src = thumbnail;
  videoCard.querySelector('.thumbnail-as-dp').src = thumbnail;
  videoCard.querySelector('.thumbnail-title').textContent = title;
  document.querySelector('#videos').appendChild(clonedTemplate);
})


let activeCard = null;

const overlay = document.querySelector('.overlay');
overlay.addEventListener('click', hideModal)
function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    hideModal(event);
  }
}

document.querySelectorAll('.play-button').forEach((playBtn) => 
  playBtn.addEventListener('click', async (event) => {
    const videoCard = event.target.closest('.video-card');
    const videoCardModal = videoCard.cloneNode(true);
    activeCard = {
      videoCard,
      videoCardModal
    }
    
    const { top, right, bottom, left, width, height } = videoCard.getBoundingClientRect()
    addStyles(videoCardModal, {
      position: 'absolute',
      inset: `${top}px ${right}px ${bottom}px ${left}px`,
      width: `${width}px`,
      height: `${height}px`,
      viewTransitionName: 'modal-card',
    });
    document.body.appendChild(videoCardModal);
    videoCard.classList.add('hidden')

    document.addEventListener('keydown', handleEscapeKey);

    const viewTransition = document.startViewTransition(() => {
      videoCardModal.classList.add('modal')
      overlay.classList.add('show')
    })

    // When view transition finishes, swap the cloned card with the video element and start playing the video
    await viewTransition.finished;

    const assetIdx = parseInt(videoCard.id.split('video-card-')[1]);
    const videoTemplate = document.querySelector('#video-container-template')
    const videoContainer = videoTemplate.content.cloneNode(true);
    const videoSource = videoContainer.querySelector('source');
    const videoElement = videoContainer.querySelector('video');

    // Set unique ID for each video instance
    videoElement.id = `video-${assetIdx}`;
    videoSource.src = assets[assetIdx].video;

    videoCardModal.innerHTML = videoContainer.firstElementChild.innerHTML;

    // Initialize Video.js and start playback
    try {
      const player = videojs(`video-${assetIdx}`, {
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
      });
      
      player.ready(() => {
        player.src({
          src: assets[assetIdx].video,
          type: 'application/x-mpegURL'
        });
        player.play();
      });
      
      // Store player reference for cleanup
      activeCard.player = player;
    } catch (error) {
      console.error('Failed to initialize video player:', error);
    }
  })
)

async function hideModal(e) {
  if (!activeCard) return;
  document.removeEventListener('keydown', handleEscapeKey);

  const { videoCard, videoCardModal, player } = activeCard;
  if (player) {
    player.dispose();
  }
  
  const viewTransition = document.startViewTransition(() => {
    videoCardModal.classList.remove('modal');
    overlay.classList.remove('show');
  })
  await viewTransition.finished;

  activeCard = null;
  videoCard.classList.remove('hidden');
  videoCardModal.remove();
}


// Utility function to add multiple styles to an element
function addStyles(nodeEl, styles) {
	for (const [key, value] of Object.entries(styles)) {
		nodeEl.style[key] = value;
	}
}