import { Directive, ElementRef } from '@angular/core';

/*
  Generated class for the HeaderTransparentDirective directive.

  See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
  for more info on Angular 2 Directives.
*/
@Directive({
  selector: '[header-transparent]' // Attribute selector
})
export class HeaderTransparent {
  /**
   * @var string Distance to keep between the top and the content when the header is hidden.
   */
  protected _topContentDistance: string = '0px';

  /**
   * @var number Animation transition, in seconds, for showing/hiding the header.
   */
  protected _animationTransition: number = 0.6;

  /**
   * @var HTMLElement Content element (<ion-content>).
   */
  protected _el: any;
  constructor(el: ElementRef) {
    console.log('Hello HeaderTransparent Directive');
    this._el = el.nativeElement;
  }

  /**
   * Binds the scroller.
   *
   * @return void
   */
  ngOnInit() {
    // Set animation transition
    this._el.previousElementSibling.style.transition = `opacity ${this._animationTransition}s ease-in-out`;
    this._el.children[1].style.transition = `margin-top ${this._animationTransition}s ease-in-out`;

    this._bindScroller(this._el.children[1]);
    //console.log(this._el.previousElementSibling);
    //console.log(this._el.children[1]);
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
        triggerScroll = 0;//`${header.offsetHeight}`;

      if (event.target.scrollTop > triggerScroll) {
        //scroller.style.marginTop = this._topContentDistance;
        headerContent.style.opacity = 0.5;
      } else if (event.target.scrollTop <= triggerScroll) {
        //scroller.style.marginTop = `${header.offsetHeight}px`;
        headerContent.style.opacity = 1;
      }
    });
  }
}
