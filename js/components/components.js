(function(){
    // Navbar
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
                        id: this.getAttribute('data-nav-id'),
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
                        text-decoration: none;
                        transition: all 0.3s;
                    }
                    
                    a:hover {
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
                        align-items: center;
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
                this._render("flex-end")
            } else if (layout == "center") {
                this._render("center")
            } else {
                this._render(this.constructor.getDefaults().layout)
            }

            this._onMQChange = (e) => this.#setMobile(e.matches);
            this._mq = window.matchMedia('(max-width: 768px)');
            this._mq.addEventListener('change', this._onMQChange);
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
                        height: 48px;
                        padding: 6px 12px;
                        width: calc(100% - 24px);
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
            this._mq?.removeEventListener('change', this._onMQChange);
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

    // Ordinary Components
    class LinkButton extends HTMLElement {
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
                this.dispatchEvent(new CustomEvent('button-click', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        id: this.getAttribute('data-link-id'),
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
                        text-decoration: none;
                        transition: all 0.3s;
                        display: inline-block;
                        padding: 8px 16px;
                        color: var(--button-link-color, #000);
                        border: 2px solid var(--button-link-border-color, #fff);
                        border-radius: 8px;
                    }
                    
                    a:hover {
                        background-color: var(--button-link-hover-bg, #fff);
                        color: var(--button-link-hover-color, #000);
                    }
                </style>
                <a part="link" href="${link}" target="${target}">
                    <slot></slot>
                </a>
            `
        }
    }

    customElements.define('link-button', LinkButton)

    // Original Components
    class MeteorBackground extends HTMLElement {
        connectedCallback() {
            this.attachShadow({ mode: 'open' })

            const isFirstVisit = true
            //const isFirstVisit = !sessionStorage.getItem('bg-animation-done')
            const svgBgUrl = './img/bg_baseball_field.svg'

            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        display: block;
                        pointer-events: none;
                    }

                    .meteor-background {
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                        background-image: radial-gradient(ellipse at top , #080e21 0%,  #1b2735 95%);
                        z-index: 0;
                    }

                    .star {
                        width: 1px;
                        height: 1px;
                        background: transparent;
                        box-shadow: 1600px 404px #fff, 1624px 79px #fff, 947px 562px #fff, 892px 372px #fff, 724px 902px #fff, 1468px 202px #fff, 646px 309px #fff, 1541px 59px #fff, 43px 350px #fff, 258px 906px #fff, 1751px 228px #fff, 880px 217px #fff, 1680px 1000px #fff, 1107px 13px #fff, 1581px 917px #fff, 1045px 869px #fff, 1794px 969px #fff, 1451px 799px #fff, 679px 193px #fff, 362px 38px #fff, 1731px 391px #fff, 215px 521px #fff, 829px 706px #fff, 1865px 343px #fff, 152px 672px #fff, 1570px 443px #fff, 761px 993px #fff, 50px 647px #fff, 1553px 731px #fff, 235px 91px #fff, 1791px 232px #fff, 1744px 30px #fff, 76px 201px #fff, 903px 553px #fff, 1836px 472px #fff, 187px 589px #fff, 688px 858px #fff, 1802px 728px #fff, 83px 66px #fff, 1389px 305px #fff, 476px 83px #fff, 1405px 77px #fff, 616px 236px #fff, 773px 777px #fff, 615px 502px #fff, 263px 959px #fff, 1647px 524px #fff, 30px 164px #fff, 1125px 309px #fff, 1393px 284px #fff, 1798px 568px #fff, 1517px 442px #fff, 513px 689px #fff, 1816px 739px #fff, 997px 818px #fff, 1304px 655px #fff, 1801px 820px #fff, 1055px 491px #fff, 486px 990px #fff, 308px 645px #fff, 1254px 392px #fff, 1459px 626px #fff, 1106px 174px #fff, 878px 611px #fff, 462px 894px #fff, 1007px 848px #fff, 1075px 418px #fff, 1354px 3px #fff, 1043px 877px #fff, 398px 968px #fff, 717px 817px #fff, 981px 313px #fff, 1741px 412px #fff, 1264px 145px #fff, 1747px 186px #fff, 1078px 617px #fff, 99px 686px #fff, 226px 667px #fff, 1553px 349px #fff, 1041px 82px #fff, 1137px 926px #fff, 1699px 393px #fff, 1795px 475px #fff, 1239px 985px #fff, 1012px 470px #fff, 1508px 749px #fff, 1564px 896px #fff, 1785px 172px #fff, 737px 480px #fff, 252px 437px #fff, 1313px 875px #fff, 792px 251px #fff, 225px 344px #fff, 575px 985px #fff, 87px 966px #fff, 660px 699px #fff, 1847px 995px #fff, 452px 107px #fff, 1098px 432px #fff, 361px 100px #fff, 1423px 988px #fff, 732px 940px #fff, 183px 937px #fff, 444px 606px #fff, 828px 488px #fff, 341px 283px #fff, 375px 397px #fff, 1441px 708px #fff, 102px 650px #fff, 226px 828px #fff, 1138px 795px #fff, 192px 57px #fff, 454px 630px #fff, 494px 986px #fff, 1868px 714px #fff, 1828px 441px #fff, 960px 425px #fff, 406px 28px #fff, 431px 449px #fff, 1018px 561px #fff, 567px 874px #fff, 1390px 104px #fff, 1324px 234px #fff, 864px 745px #fff, 704px 221px #fff, 1471px 901px #fff, 376px 477px #fff, 613px 337px #fff, 842px 525px #fff, 1850px 215px #fff, 1519px 174px #fff, 1626px 91px #fff, 1755px 172px #fff, 1874px 234px #fff, 17px 693px #fff, 30px 634px #fff, 1439px 287px #fff, 1717px 7px #fff, 400px 694px #fff, 614px 758px #fff, 1845px 34px #fff, 1394px 231px #fff, 523px 815px #fff, 1605px 634px #fff, 719px 196px #fff, 758px 24px #fff, 1082px 198px #fff, 848px 981px #fff, 584px 699px #fff, 1041px 333px #fff, 530px 314px #fff, 510px 489px #fff, 360px 413px #fff, 1822px 927px #fff, 208px 437px #fff, 1234px 507px #fff, 1290px 864px #fff, 939px 500px #fff, 525px 97px #fff, 827px 890px #fff, 49px 367px #fff, 1299px 213px #fff, 105px 979px #fff, 1033px 117px #fff, 449px 203px #fff, 639px 821px #fff, 1493px 904px #fff, 1086px 511px #fff, 174px 119px #fff, 803px 866px #fff, 1747px 662px #fff, 595px 743px #fff, 521px 280px #fff, 59px 697px #fff, 1312px 71px #fff, 1410px 936px #fff, 7px 269px #fff, 313px 754px #fff, 1911px 917px #fff, 1886px 654px #fff, 894px 66px #fff, 1381px 254px #fff, 1521px 63px #fff, 1845px 687px #fff, 291px 588px #fff, 1451px 618px #fff, 1712px 922px #fff, 271px 803px #fff, 840px 765px #fff, 846px 24px #fff, 707px 430px #fff, 526px 66px #fff, 1251px 335px #fff, 613px 414px #fff, 420px 107px #fff, 499px 351px #fff, 22px 956px #fff, 1392px 421px #fff, 533px 68px #fff, 529px 448px #fff, 104px 43px #fff, 1346px 520px #fff, 1159px 576px #fff, 1383px 594px #fff, 1489px 856px #fff, 1624px 27px #fff, 636px 148px #fff, 320px 359px #fff, 10px 5px #fff, 1476px 407px #fff, 945px 393px #fff, 792px 252px #fff, 264px 522px #fff, 1835px 502px #fff, 1159px 261px #fff, 921px 302px #fff, 149px 126px #fff, 664px 389px #fff, 1902px 680px #fff, 1373px 59px #fff, 880px 702px #fff, 887px 227px #fff, 1633px 769px #fff, 570px 499px #fff, 792px 93px #fff, 1231px 903px #fff, 1413px 453px #fff, 127px 593px #fff, 1876px 6px #fff, 731px 185px #fff, 1603px 745px #fff, 978px 604px #fff, 699px 936px #fff, 1402px 340px #fff, 1689px 811px #fff, 1214px 588px #fff, 103px 737px #fff, 982px 86px #fff, 261px 239px #fff, 184px 980px #fff, 1698px 239px #fff, 1887px 139px #fff, 458px 353px #fff, 79px 598px #fff, 1349px 727px #fff, 1444px 380px #fff, 1607px 895px #fff, 901px 106px #fff, 994px 48px #fff, 1062px 761px #fff, 1509px 790px #fff, 1358px 427px #fff, 1513px 635px #fff, 571px 760px #fff, 703px 611px #fff, 513px 286px #fff, 678px 97px #fff, 684px 471px #fff, 1224px 984px #fff, 517px 314px #fff, 1431px 212px #fff, 723px 608px #fff, 176px 946px #fff, 1230px 320px #fff, 1012px 805px #fff, 1683px 758px #fff, 22px 355px #fff, 1533px 987px #fff, 75px 293px #fff, 514px 883px #fff, 25px 945px #fff, 928px 174px #fff, 1781px 487px #fff, 589px 550px #fff, 981px 197px #fff, 1666px 328px #fff, 330px 701px #fff, 715px 431px #fff, 232px 4px #fff, 202px 347px #fff, 1043px 270px #fff, 699px 828px #fff, 643px 646px #fff, 507px 631px #fff, 509px 758px #fff, 267px 907px #fff, 1537px 800px #fff, 1727px 734px #fff, 109px 673px #fff, 1329px 546px #fff, 1887px 851px #fff, 904px 899px #fff, 728px 817px #fff, 75px 132px #fff, 1816px 725px #fff, 1838px 697px #fff, 1740px 920px #fff, 1430px 424px #fff, 582px 25px #fff, 117px 875px #fff;
                    }

                    .meteor-1 {
                        position: absolute;
                        top: 283px;
                        left: 91%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 5.4s linear infinite;
                    }
                    .meteor-1:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-2 {
                        position: absolute;
                        top: 80px;
                        left: 23%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 7s linear infinite;
                    }
                    .meteor-2:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-3 {
                        position: absolute;
                        top: 177px;
                        left: 50%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 9.9s linear infinite;
                    }
                    .meteor-3:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-4 {
                        position: absolute;
                        top: 177px;
                        left: 35%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 8.8s linear infinite;
                    }
                    .meteor-4:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-5 {
                        position: absolute;
                        top: 89px;
                        left: 11%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 3.6s linear infinite;
                    }
                    .meteor-5:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-6 {
                        position: absolute;
                        top: 173px;
                        left: 68%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 5.1s linear infinite;
                    }
                    .meteor-6:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-7 {
                        position: absolute;
                        top: 132px;
                        left: 74%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 7.2s linear infinite;
                    }
                    .meteor-7:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-8 {
                        position: absolute;
                        top: 294px;
                        left: 76%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 7.6s linear infinite;
                    }
                    .meteor-8:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-9 {
                        position: absolute;
                        top: 254px;
                        left: 40%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 3.7s linear infinite;
                    }
                    .meteor-9:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-10 {
                        position: absolute;
                        top: 217px;
                        left: 38%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 4.1s linear infinite;
                    }
                    .meteor-10:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-11 {
                        position: absolute;
                        top: 95px;
                        left: 21%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 5.9s linear infinite;
                    }
                    .meteor-11:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-12 {
                        position: absolute;
                        top: 279px;
                        left: 90%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 8s linear infinite;
                    }
                    .meteor-12:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-13 {
                        position: absolute;
                        top: 235px;
                        left: 17%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 8.5s linear infinite;
                    }
                    .meteor-13:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-14 {
                        position: absolute;
                        top: 126px;
                        left: 72%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 8.5s linear infinite;
                    }
                    .meteor-14:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    .meteor-15 {
                        position: absolute;
                        top: 263px;
                        left: 89%;
                        width: 300px;
                        height: 1px;
                        transform: rotate(-45deg);
                        background-image: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
                        animation: meteor 9.3s linear infinite;
                    }
                    .meteor-15:before {
                        content: "";
                        position: absolute;
                        width: 4px;
                        height: 5px;
                        border-radius: 50%;
                        margin-top: -2px;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 0 15px 3px #fff;
                    }

                    @keyframes meteor {
                        0% {
                            opacity: 1;
                            margin-top: -300px;
                            margin-right: -300px;
                        }
                        12% {
                            opacity: 0;
                        }
                        15% {
                            margin-top: 300px;
                            margin-left: -600px;
                            opacity: 0;
                        }
                        100% {
                            opacity: 0;
                        }
                    }

                    .baseball-field {
                        position: absolute;
                        bottom: -80px;
                        width: 100%;
                        height: 100%;
                        background-image: url('${svgBgUrl}');
                        background-size: cover;
                        background-position: center;
                        z-index: 1;

                        /*初次動畫*/
                        opacity: ${isFirstVisit ? 0 : 1};
                        transform: ${isFirstVisit ? 'translateY(30px)' : 'translateY(0)'};
                        transition: opacity 1.2s ease, transform 1.2s ease;
                    }
                </style>
                <div class="meteor-background">
                    <div class="star"></div>
                    <div class="meteor-1"></div>
                    <div class="meteor-2"></div>
                    <div class="meteor-3"></div>
                    <div class="meteor-4"></div>
                    <div class="meteor-5"></div>
                    <div class="meteor-6"></div>
                    <div class="meteor-7"></div>
                    <div class="meteor-8"></div>
                    <div class="meteor-9"></div>
                    <div class="meteor-10"></div>
                    <div class="meteor-11"></div>
                    <div class="meteor-12"></div>
                    <div class="meteor-13"></div>
                    <div class="meteor-14"></div>
                    <div class="meteor-15"></div>
                </div>
                <div class="baseball-field">
                </div>
            `

            if (isFirstVisit) {
                setTimeout(() => {
                    this._playIntroAnimation()
                }, 1000);
            } else {
                this._playIntroAnimation()
            }
        }

        _playIntroAnimation() {
            const field = this.shadowRoot.querySelector('.baseball-field');

            field.style.opacity = '1';
            field.style.transform = 'translateY(0)';

            field.addEventListener('transitionend', () => {
                sessionStorage.setItem('bg-animation-done', 'true');

                this.dispatchEvent(new CustomEvent('bg-animation-done', {
                    bubbles: true,
                    composed: true
                }))
            }, {once: true})
        }
    }

    customElements.define('meteor-background', MeteorBackground)
})()