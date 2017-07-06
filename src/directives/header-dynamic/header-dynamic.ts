import { Directive, ElementRef } from '@angular/core';

/*
  Generated class for the HeaderDynamicDirective directive.

  See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
  for more info on Angular 2 Directives.
*/
@Directive({
    selector: '[header-dynamic]' // Attribute selector
})
export class HeaderDynamic {
    /**
     * @var string Distance to keep between the top and the content when the header is hidden.
     */
    protected _topContentDistance: string = '0px';

    /**
     * @var number Animation transition, in seconds, for showing/hiding the header.
     */
    protected _animationTransition: number = 0.6;
    /**
     * @var string Original Padding
     */
    //protected _originalPadding: string;
    /**
     * @var HTMLElement Content element (<ion-content>).
     */
    protected _el: any;
    constructor(el: ElementRef) {
        console.log('Hello HeaderDynamic Directive');
        this._el = el.nativeElement;
    }

    /**
     * Binds the scroller.
     *
     * @return void
     */
    ngOnInit() {
        // Set animation transition
        this._el.previousElementSibling.style.transition = `${this._animationTransition}s ease-in-out`;
        this._el.children[1].style.transition = `${this._animationTransition}s ease-in-out`;
        this._el.children[1].children[0].style.transition = `${this._animationTransition}s ease-in-out`;
        this._el.previousElementSibling.querySelector('ion-title').parentElement.style.opacity = 0;
        this._el.previousElementSibling.querySelector('ion-title').parentElement.style.transition = `${this._animationTransition}s ease-in-out`;

        this._bindScroller(this._el.children[1]);
        //console.log(this._el.previousElementSibling);
        //console.log(this._el.previousElementSibling.querySelector('ion-title').parentElement);
    }

    /**
     * Listen to scroll events in <scroll-content> component.
     *
     * @param el HTMLElement Scroller element (<scroll-content>).
     * @return void
     */
    protected _bindScroller(el): void {
        el.addEventListener('scroll', event => {
            //console.log(event.target);

            let scroller = event.target,
                header = event.target.parentElement.previousElementSibling,
                headerContent = header.children[0].children[0],
                headerTitle = header.children[0].querySelector('ion-title').parentElement,
                nameContent = event.target.children[0],
                triggerScroll = `${header.offsetHeight}`;
            //console.log(headerTitle);

            if (event.target.scrollTop > triggerScroll) {
                //scroller.style.marginTop = this._topContentDistance;
                //headerContent.style.opacity = 0.33;
                nameContent.style.opacity = 0;
                nameContent.style.transform = `scale(0)`;
                headerTitle.style.opacity = 1;
            } else if (event.target.scrollTop <= triggerScroll) {
                //scroller.style.marginTop = `${header.offsetHeight}px`;
                //headerContent.style.opacity = 1;
                nameContent.style.opacity = 1;
                nameContent.style.transform = `scale(1)`;
                headerTitle.style.opacity = 0;
            }
        });
    }
}
