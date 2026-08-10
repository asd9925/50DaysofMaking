const GALLERY_ID = 'gallery';

function getColumnCount() {
    const w = window.innerWidth;
    if (w < 600) return 1;
    if (w < 1000) return 2;
    return 3;
}

let originalItems = null;

function getOriginalItems() {
    if (originalItems) return originalItems;
    const gallery = document.getElementById(GALLERY_ID);
    originalItems = Array.from(gallery.querySelectorAll('.gallery-item'));
    return originalItems;
}

function layoutMasonry() {
    const gallery = document.getElementById(GALLERY_ID);
    const items = getOriginalItems();
    const numCols = getColumnCount();

    gallery.innerHTML = '';
    const columns = [];
    const heights = new Array(numCols).fill(0);

    for (let i = 0; i < numCols; i++) {
        const col = document.createElement('div');
        col.className = 'masonry-column';
        gallery.appendChild(col);
        columns.push(col);
    }

    items.forEach(item => {
        let shortestIndex = 0;
        for (let i = 1; i < heights.length; i++) {
            if (heights[i] < heights[shortestIndex]) shortestIndex = i;
        }
        columns[shortestIndex].appendChild(item);
        const estimatedHeight = item.offsetHeight || 300;
        heights[shortestIndex] += estimatedHeight + 8; 
    });
}

function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

const debouncedLayout = debounce(layoutMasonry, 150);

function waitForMediaThenLayout() {
    const items = getOriginalItems();
    let pending = 0;

    items.forEach(item => {
        const media = item.querySelector('img, video');
        if (!media) return;

        if (media.tagName === 'IMG') {
            if (!media.complete) {
                pending++;
                media.addEventListener('load', onMediaReady, { once: true });
                media.addEventListener('error', onMediaReady, { once: true });
            }
        } else if (media.tagName === 'VIDEO') {
            if (media.readyState < 1) { 
                pending++;
                media.addEventListener('loadedmetadata', onMediaReady, { once: true });
                media.addEventListener('error', onMediaReady, { once: true });
            }
        }
    });

    function onMediaReady() {
        pending--;
        if (pending <= 0) {
            layoutMasonry();
        }
    }

    layoutMasonry();
    if (pending === 0) {
        layoutMasonry();
    }
}

window.addEventListener('load', waitForMediaThenLayout);
window.addEventListener('resize', debouncedLayout);