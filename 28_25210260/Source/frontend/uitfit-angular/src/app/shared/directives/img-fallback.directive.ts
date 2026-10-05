import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

/** Ảnh lỗi/không có → thay bằng ảnh mặc định */
@Directive({ selector: 'img[appImgFallback]' })
export class ImgFallbackDirective {
  readonly appImgFallback = input<string>('images/exercise-placeholder.svg');
  private el = inject(ElementRef<HTMLImageElement>);
  private replaced = false;

  @HostListener('error')
  onError(): void {
    if (this.replaced) return;
    this.replaced = true;
    this.el.nativeElement.src = this.appImgFallback() || 'images/exercise-placeholder.svg';
  }
}
