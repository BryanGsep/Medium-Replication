import Quill from 'quill';

const Module = Quill.import('core/module');
const BlockEmbed = Quill.import('blots/block/embed');

export class ImageBlot extends BlockEmbed {
    static blotName = 'image';
    static tagName = ['figure', 'image'];
  
    static create(value: { alt: any; caption: string; src: any; }) {
        const node = super.create();
        const img = window.document.createElement('img');
        if (value.alt || value.caption) {
            img.setAttribute('alt', value.alt || value.caption);
        }
        if (value.src || typeof value === 'string') {
            img.setAttribute('src', value.src || value);
        }
        node.appendChild(img);
        if (value.caption) {
            const caption = window.document.createElement('figcaption');
            caption.innerHTML = value.caption;
            node.appendChild(caption);
        }
        node.className = 'ql-card-editable ql-card-figure';
        return node;
    }
  
    constructor(node: { __onSelect: () => void; querySelector: (arg0: string) => any; appendChild: (arg0: any) => void; }) {
        super(node);
        node.__onSelect = () => {
            if (!node.querySelector('input')) {
                let caption = node.querySelector('figcaption');
                const captionInput = window.document.createElement('input');
                captionInput.placeholder = 'Type caption for image (optional)';
                if (caption) {
                    captionInput.value = caption.innerText;
                    caption.innerHTML = '';
                    caption.appendChild(captionInput);
                } else {
                    caption = window.document.createElement('figcaption');
                    caption.appendChild(captionInput);
                    node.appendChild(caption);
                }
                captionInput.addEventListener('blur', (e: any) => {
                    e.target.focus();
                });
            }
            if (node.querySelector('input')) {
                node.querySelector('input').focus();
            }
        }
    }
  
    static value(node: { querySelector: (arg0: string) => any; }) {
        const img = node.querySelector('img');
        const figcaption = node.querySelector('figcaption');
        if (!img) return false;
        return {
            alt: img.getAttribute('alt'),
            src: img.getAttribute('src'),
            caption: figcaption ? figcaption.innerText : null
        };
    }
}

export class CardEditableModule extends Module {
    haslistener = false;
    constructor(quill: any, options: any) {
        super(quill, options);
        const listener = (e: any): any => {
            if (!document.body.contains(quill.root)) {
                return document.body.removeEventListener('click', listener);
            }
            const elm = e.target.closest('.ql-card-editable');
            const deselectCard = () => {
                this.haslistener = false;
                if (elm.__onDeselect) {
                    elm.__onDeselect(quill);
                } else {
                    quill.setSelection(quill.getIndex(elm.__blot.blot) + 1, 0, 'user');
                }
            }
            if (elm && elm.__blot && elm.__onSelect && !this.haslistener) {
                e.preventDefault();
                this.haslistener = true;
                elm.__onSelect(quill);
                const handleClick = (e: { which: number; target: any; }) => {
                    if (e.which === 1 && !elm.contains(e.target)) {
                        window.removeEventListener('click', handleClick);
                        const caption = elm.querySelector('figcaption');
                        const captionInput = elm.querySelector('input');
                        const value = captionInput.value;
                        if (!value || value === '') {
                            caption.remove();
                        } else {
                            captionInput.remove();
                            caption.innerText = value;
                        }
                        deselectCard();
                    }
                }
                window.addEventListener('click', handleClick);
            }
        };
        quill.emitter.listenDOM('click', document.body, listener);
    }
}
