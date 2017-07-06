import { Directive, ElementRef } from '@angular/core';

/*
  Generated class for the HeaderScrollerDirective directive.

  See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
  for more info on Angular 2 Directives.
*/
@Directive({
  selector: '[header-scroller]' // Attribute selector
})
export class HeaderScroller {
  /**
   * @var number Distance from page top to trigger the hide/show functionality.
   */
  protected _topTriggeringDistance: number = 100;

  /**
   * @var string Distance to keep between the top and the content when the header is hidden.
   */
  protected _topContentDistance: string = '10px';

  /**
   * @var number Animation transition, in seconds, for showing/hiding the header.
   */
  protected _animationTransition: number = 0.6;

  /**
   * @var HTMLElement Content element (<ion-content>).
   */
  protected _el: any;
  constructor(el: ElementRef) {
    console.log('Hello HeaderScroller Directive');
    this._el = el.nativeElement;
  }

  /**
   * Binds the scroller.
   *
   * @return void
   */
  ngOnInit() {
    // Set animation transition
    this._el.previousElementSibling.style.transition = `top ${this._animationTransition}s ease-in-out`;
    this._el.children[1].style.transition = `margin-top ${this._animationTransition}s ease-in-out`;

    this._bindScroller(this._el.children[1]);
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
        header = event.target.parentElement.previousElementSibling;

      if (event.target.scrollTop > this._topTriggeringDistance && header.style.top != '0') {
        scroller.style.marginTop = this._topContentDistance;
        header.style.top = `-${header.offsetHeight}px`;
      } else if (event.target.scrollTop <= this._topTriggeringDistance && header.style.top == `-${header.offsetHeight}px`) {
        header.style.top = '0';
        scroller.style.marginTop = `${header.offsetHeight}px`;
      }
    });
  }
}
