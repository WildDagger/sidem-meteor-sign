(function() {
    const elementBg = document.querySelector('meteor-background')
    const elementMain = document.querySelector('main')

    elementBg.addEventListener('bg-animation-done', () => {
        elementMain.style.opacity = '1'
    })

    const elementNavButtons = document.querySelectorAll('nav-button')

    elementNavButtons.forEach(button => {
        button.addEventListener('nav-button-click', (e) => {
            console.log('nav-button-click event received in main.js', e.detail)

            const {id, link, target} = e.detail
            if (link) {
                if (link === '#') return

                if (target === '_blank') {
                    window.open(link, '_blank')
                } else {
                    window.location.href = link
                }
            }

            if (id) {
                const targetElement = document.getElementById(id)
                if (targetElement) {
                    targetElement.scrollIntoView({behavior: 'smooth'})
                }
            }
        })
    })
})()