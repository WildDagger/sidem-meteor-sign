(function(){
    class NavButton extends HTMLElement {
        static getDefaults() {
            return {
                "link": "#",
                "target": "_self"
            }
        }

        static get observedAttributes() {
            return ["lang"]
        }

        connectedCallback() {
            this.attachShadow({mode: "open"})
            this._render(
                this.getAttribute("link") ?? this.constructor.getDefaults().link,
                this.getAttribute("target") ?? this.constructor.getDefaults().target
            )
            this.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('nav-button-click', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        id: this.getAttribute('nav-id'),
                        link: this.getAttribute('link'),
                        target: this.getAttribute('target')
                    }
                }))
            })
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (!this.shadowRoot || oldValue == newValue) return

            if (name == "link") {
                this.shadowRoot.querySelector('a')?.setAttribute('href', newValue ?? this.constructor.getDefaults().link)
            }

            if (name == "target") {
                this.shadowRoot.querySelector('a')?.setAttribute('target', newValue ?? this.constructor.getDefaults().target)
            }
        }

        _render(link, target) {
            if (!this.shadowRoot) {
                this.attachShadow({mode: "open"})
            }
            this.shadowRoot.innerHTML = `
                <style>
                    a {
                        display: inline-flex; 
                        align-items: center; 
                        padding: 8px 16px; 
                    }
                    
                    :host([active]) a {
                        font-weight: 500;
                    }
                </style>
                <a part="link" href="${link}" target="${target}">
                    <slot></slot>
                </a>
            `
        }
    }

    class NavDropdown extends HTMLElement {
        connectedCallback() {
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = `
            <style>
                .trigger { cursor: pointer; }
                .items {
                display: none;
                position: absolute;
                background: white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                border-radius: 8px;
                padding: 4px 0;
                min-width: 160px;
                }
                :host([open]) .items { display: block; }
            </style>
            <div class="trigger">
                <slot name="trigger"></slot>
            </div>
            <div class="items">
                <slot></slot>
            </div>
            `;

            this.shadowRoot.querySelector('.trigger')
            .addEventListener('click', () => this.toggleAttribute('open'));
        }
    }

    class NavDropdownItem extends NavButton {
        _render(link, target) {
            this.shadowRoot.innerHTML = `
                <a part="link" href="${link}" target="${target}" role="menuitem">
                    <slot></slot>
                </a>
            `
        }
    }

    class NavMenu extends HTMLElement {
        static get observedAttributes() {
            return ["lang"]
        }

        connectedCallback() {
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = `
                <style>
                    .menu {
                        display: flex;
                        align-item: center;
                        gap: 8px;
                    }

                    .hamburger {
                        display: none;
                        cursor: pointer;
                    }

                    .items {
                        display: flex;
                        gap: 8px;
                    }

                    :host([mobile]) .hamburger { display: block; }
                    :host([mobile]) .items {
                        display: none;
                        position: absolute;
                        top: 72px;
                        left: 0;
                        right: 0;
                        flex-direction: column;
                        padding: 8px 0;
                    }

                    :host([mobile][open]) .items { display: flex; }
                </style>
                <div class="menu">
                    <button class="hamburger" aria-label="選單" aria-expanded="false">☰</button>
                    <div class="items">
                        <slot></slot>
                    </div>
                </div>
            `

            this.shadowRoot.querySelector('.hamburger').addEventListener('click', () => this.#toggleOpen())
        }
        
        #toggleOpen() {
            const isOpen = this.toggleAttribute('open')
            this.shadowRoot.querySelector('.hamburger').setAttribute('aria-expanded', isOpen)
        }
    }

    class NavBrand extends HTMLElement {
        static get observedAttributes() {
            return ["lang"]
        }

        connectedCallback() {
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = `
                <style>
                </style>
                <div class="nav-brand">
                    <slot></slot>
                </div>
            `
        }
    }

    class MainNavbar extends HTMLElement {
        static getDefaults() {
            return {
                'layout': 'space-between'
            }
        }

        static get observedAttributes() {
            return ["lang"]
        }

        connectedCallback() {
            this.attachShadow({ mode: 'open' });
            const layout = this.getAttribute('layout') ?? this.constructor.getDefaults().layout

            if (layout == "flex-start") {
                this._render("flex-start")
            } else if (layout == "flex-end") {
                this._render("center")
            } else if (layout == "center") {
                this._render("flex-end")
            } else {
                this._render(this.constructor.getDefauts().layout)
            }

            this._mq = window.matchMedia('(max-width: 768px)');
            this._mq.addEventListener('change', e => this.#setMobile(e.matches));
            this.#setMobile(this._mq.matches);
        }

        _render(layout) {
            this.shadowRoot.innerHTML = `
                <style>
                    nav {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        position: fixed;
                        height: 72px;
                        padding: 12px;
                    }
                    nav-menu {
                        margin-left: auto;
                    }
                </style>
                <nav part="main" style="justify-content: ${layout}">
                    <slot></slot>
                </nav>
            `;
        }

        disconnectedCallback() {
            this._mq?.removeEventListener('change', this.#setMobile);
        }

        #setMobile(isMobile) {
            this.toggleAttribute('mobile', isMobile);
            // 通知 nav-menu 切換模式
            this.querySelector('nav-menu')?.toggleAttribute('mobile', isMobile);
        }
    }

    customElements.define('nav-button', NavButton)
    customElements.define('nav-dropdown', NavDropdown)
    customElements.define('nav-dropdown-item', NavDropdownItem)
    customElements.define('nav-menu', NavMenu)
    customElements.define('nav-brand', NavBrand)
    customElements.define('main-navbar', MainNavbar)
})()