(function() {
    const elementBg = document.querySelector('meteor-background')
    const elementMain = document.querySelector('main')

    elementBg.addEventListener('bg-animation-done', () => {
        elementMain.style.opacity = '1'
    })
})()