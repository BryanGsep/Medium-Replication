import { AfterViewInit, Component } from '@angular/core';
import Quill from 'quill';
const Delta = Quill.import('delta');
import * as $ from 'jquery';
import { ImageBlot, CardEditableModule } from './quill-caption';

Quill.register({
    'formats/image': ImageBlot,
    'modules/cardEditable': CardEditableModule,
}, true);

@Component({
    selector: 'app-writing-content',
    templateUrl: './writing-content.component.html',
    styleUrls: ['./writing-content.component.scss']
})
export class WritingContentComponent implements AfterViewInit {
    quill: Quill | undefined;
    videoInsertIndex: any = null; 
    enableVideoInsert = false;
    enableTitleInsert = false;
    emptyContent = false;
    headBlot: any = null;
    titleBlot: any = null;
    
    ngAfterViewInit(): void {
        this.quill = new Quill('#editor', {
            theme: 'bubble',
            modules: {
                cardEditable: true,
                syntax: true,
                toolbar: '#toolbar1'
            }
        });
    
        this.quill.on('selection-change', (range) => {
            // console.log('range: ', range);
            if (!range) {
                return;
            }
            const { index, length } = range;
            if (this.enableTitleInsert && index <= 5) {
                this.quill?.setSelection(0, 0);
                return;
            }
    
            if (this.enableVideoInsert && index >= this.videoInsertIndex && index <= this.videoInsertIndex + 43) {
                this.quill?.setSelection(this.videoInsertIndex, 0);
                return;
            } else if (this.enableVideoInsert) {
                this.quill?.updateContents(new Delta()
                    .retain(this.videoInsertIndex)
                    .delete(43)
                );
                this.enableVideoInsert = false
            }
    
            const startContentIndex = this.getLineFromBlot(this.headBlot)
            if (this.emptyContent && index > startContentIndex && index <= startContentIndex+18) {
                this.quill?.setSelection(startContentIndex, 0);
            }
    
            const bounds = this.quill?.getBounds(this.getLineFromIndex(index), length);
            if (length === 0 && this.isEmptyLine(index)) {
                const top = (bounds?.top || 0) + ($('.ql-editor').offset()?.top || 0) - 77;
                const left = (bounds?.left || 0) + ($('.ql-editor').offset()?.left || 0) - 70;
                $('.close-toolbar-button').css({display: 'none'});
                $('#toolbar2').css({display: 'none'});
                $('.open-toolbar-button').css({
                    display: 'block',
                    top: `${top}px`,
                    left: `${left}px`,
                })
            } else {
                $('.close-toolbar-button').css({display: 'none'});
                $('#toolbar2').css({display: 'none'});
                $('.open-toolbar-button').css({display: 'none'});
            }
        });
    
        this.quill.on('text-change', (delta) => {
            // console.log('delta: ', delta);
            if (delta.ops?.[1]?.insert === '\n' || delta.ops?.[0]?.insert === '\n') {
                // Get position of that line
                const index = this.quill?.getSelection()?.index
                if (index !== undefined && typeof index === 'number') {
                    const bounds = this.quill?.getBounds(index + 1);
                    const top = (bounds?.top || 0) + ($('.ql-editor').offset()?.top || 0) - 77;
                    const left = (bounds?.left || 0) + ($('.ql-editor').offset()?.left || 0) - 70;
                    $('.close-toolbar-button').css({display: 'none'});
                    $('#toolbar2').css({display: 'none'});
                    $('.open-toolbar-button').css({
                        display: 'block',
                        top: `${top}px`,
                        left: `${left}px`,
                    })
                } else {
                    $('.close-toolbar-button').css({display: 'none'});
                    $('#toolbar2').css({display: 'none'});
                    $('.open-toolbar-button').css({display: 'none'});
                }
            } else {
                $('.close-toolbar-button').css({display: 'none'});
                $('#toolbar2').css({display: 'none'});
                $('.open-toolbar-button').css({display: 'none'});
            }
    
            if (this.enableVideoInsert) {
                this.enableVideoInsert = false;
                let insertString = '';
                if (delta.ops?.[0]?.insert) {
                    insertString = delta.ops?.[0].insert;
                } else if (delta.ops?.[1]?.insert) {
                    insertString = delta.ops?.[1].insert;
                }
    
                const url = this.getVideoUrl(insertString);
                if (insertString && this.isLink(insertString) && url) {
                    this.quill?.updateContents(new Delta()
                        .retain(this.videoInsertIndex)
                        .delete(43 + insertString.length)
                    );
                    this.quill?.insertEmbed(this.videoInsertIndex, 'video', url);
                    this.quill?.setSelection(this.videoInsertIndex + 1);
                } else {
                    this.quill?.updateContents(new Delta()
                        .retain(this.videoInsertIndex)
                        .retain(insertString.length, {color: 'rgba(0,0,0,.84)'})
                        .delete(43)
                    );
                }
                return;
            }
    
            if (this.enableTitleInsert && this.quill?.getSelection()?.index && this.getLineFromIndex(this.quill?.getSelection()?.index || 0) === 0) {
                this.enableTitleInsert = false;
                let insertString = '';
                if (delta.ops?.[0]?.insert) {
                    insertString = delta.ops?.[0].insert;
                } else if (delta.ops?.[1]?.insert) {
                    insertString = delta.ops?.[1].insert;
                }
    
                this.quill?.updateContents(new Delta()
                    .retain(insertString.length, {color: 'rgba(0,0,0,.84)'})
                    .delete(5)
                );
                return;
            }
    
            if (this.emptyContent && this.getLineFromIndex(this.quill?.getSelection()?.index || 0) === this.getLineFromBlot(this.headBlot)) {
                this.emptyContent = false;
                let insertString = '';
                if (delta.ops?.[0]?.insert) {
                    insertString = delta.ops?.[0].insert;
                } else if (delta.ops?.[1]?.insert) {
                    insertString = delta.ops?.[1].insert;
                }
    
                this.quill?.updateContents(new Delta()
                    .retain(this.getLineFromBlot(this.headBlot))
                    .retain(insertString.length, {color: 'rgba(0,0,0,.84)'})
                    .delete(18)
                );
                return;
            }
        })
    
        this.quill.setSelection(0, 0);
        this.quill?.updateContents(new Delta()
            .insert('Title', { color: '#b3b3b1' })
            .retain(1, {header: 3})
            .insert('Tell your story...', { color: '#b3b3b1' })
        );
        this.quill.setSelection(6, 0);
        this.titleBlot = this.quill.getLine(0)[0];
        this.headBlot = this.quill.getLine(6)[0];
        this.enableTitleInsert = true;
        this.emptyContent = true;
        $('.ql-bold').html('<svg class="svgIcon-use" width="21" height="21"><path d="M10.308 17.993h-5.92l.11-.894.783-.12c.56-.11.79-.224.79-.448V5.37c0-.225-.113-.336-.902-.448H4.5l-.114-.894h6.255c4.02 0 5.58 1.23 5.58 3.13 0 1.896-1.78 3.125-3.79 3.463v.11c2.69.34 4.25 1.56 4.25 3.57 0 2.35-2.01 3.69-6.37 3.69l.02.01h-.02zm-.335-12.96H8.967V10.5h1.23c1.788 0 2.79-1.23 2.79-2.683 0-1.685-1.004-2.803-3.006-2.803v.02zm-.223 6.36h-.783v5.588l1.225.23h.22c1.67 0 3.01-1.004 3.01-2.792 0-2.122-1.566-3.016-3.69-3.016h.018z" fill-rule="evenodd"></path></svg>');
        $('.ql-italic').html('<svg class="svgIcon-use" width="21" height="21"><path d="M9.847 18.04c-.533 0-2.027-.64-1.92-.853l2.027-7.68-.64-.214-1.387 1.494-.427-.427c.534-1.173 1.707-2.667 2.774-2.667.533 0 2.24.534 2.133.854l-2.133 7.786.533.214 1.6-1.067.427.427c-.64 1.066-1.92 2.133-2.987 2.133zm2.347-11.733c-.96 0-1.387-.64-1.387-1.387 0-1.067.747-1.92 1.493-1.92.854 0 1.387.64 1.387 1.493-.107 1.067-.747 1.814-1.493 1.814z" fill-rule="evenodd"></path></svg>');
        $('.ql-link').html('<svg class="svgIcon-use" width="21" height="21"><path d="M2.2 13.17c0-.575.125-1.11.375-1.605l.02-.018v-.02c.014 0 .02-.008.02-.02 0-.014 0-.02.02-.02.122-.256.31-.52.576-.805l3.19-3.18c0-.008 0-.015.01-.02.01-.006.01-.013.01-.02.44-.413.91-.7 1.44-.853-.63.71-1.03 1.5-1.19 2.36-.04.24-.06.52-.06.81 0 .14.01.24.02.33L4.67 12.1c-.19.19-.316.407-.376.653a1.33 1.33 0 00-.057.415c0 .155.02.314.06.477.075.21.2.403.376.58l1.286 1.31c.27.276.62.416 1.03.416.42 0 .78-.14 1.06-.42l1.23-1.25.79-.78 1.15-1.16c.08-.09.19-.22.28-.4.103-.2.15-.42.15-.67 0-.16-.02-.31-.056-.45l-.02-.02v-.02l-.07-.14c0-.01-.013-.03-.04-.06l-.06-.13-.02-.02c0-.02-.01-.03-.02-.05a.592.592 0 00-.143-.16l-.48-.5c0-.042.015-.1.04-.15l.06-.12 1.17-1.14.087-.09.56.57c.023.04.08.1.16.18l.05.04c.006.018.02.036.035.06l.04.054c.01.01.02.025.03.04.03.023.04.046.04.058.04.04.08.09.1.14l.02.02c0 .018.01.03.024.04l.105.197v.02c.098.157.19.384.297.68a1 1 0 01.04.255c.06.21.08.443.08.7 0 .22-.02.43-.06.63-.12.71-.44 1.334-.95 1.865l-.66.67-.97.972-1.554 1.57C8.806 17.654 7.98 18 7.01 18s-1.8-.34-2.487-1.026l-1.296-1.308a3.545 3.545 0 01-.913-1.627 4.541 4.541 0 01-.102-.88v-.01l-.012.01zm5.385-3.433c0-.183.023-.393.07-.63.13-.737.448-1.362.956-1.87l.66-.662.97-.983 1.56-1.56C12.48 3.34 13.3 3 14.27 3c.97 0 1.8.34 2.483 1.022l1.29 1.314c.44.438.744.976.913 1.618.067.32.102.614.102.87 0 .577-.123 1.11-.375 1.605l-.02.01v.02l-.02.04c-.148.27-.35.54-.6.81l-3.187 3.19c0 .01 0 .01-.01.02-.01 0-.01.01-.01.02-.434.42-.916.7-1.427.83.63-.67 1.03-1.46 1.19-2.36.04-.26.06-.53.06-.81 0-.14-.01-.26-.02-.35l1.99-1.97c.18-.21.3-.42.35-.65.04-.12.05-.26.05-.42 0-.16-.02-.31-.06-.48-.07-.19-.19-.38-.36-.58l-1.3-1.3a1.488 1.488 0 00-1.06-.42c-.42 0-.77.14-1.06.41L11.98 6.7l-.79.793-1.157 1.16c-.088.075-.186.21-.294.4-.09.233-.14.46-.14.67 0 .16.02.31.06.452l.02.02v.023l.06.144c0 .006.01.026.05.06l.06.125.02.02c0 .01 0 .013.01.02 0 .005.01.01.01.02.05.08.1.134.14.16l.47.5c0 .04-.02.093-.04.15l-.06.12-1.15 1.15-.1.08-.56-.56a2.31 2.31 0 00-.18-.187c-.02-.01-.02-.03-.02-.04l-.02-.02a.375.375 0 01-.1-.122c-.03-.024-.05-.043-.05-.06l-.1-.15-.02-.02-.02-.04L8 11.4v-.02a5.095 5.095 0 01-.283-.69 1.035 1.035 0 01-.04-.257 2.619 2.619 0 01-.093-.7v.007z" fill-rule="evenodd"></path></svg>');
        $('.ql-header[value="3"]').html('<svg class="svgIcon-use" width="21" height="21"><path d="M3 2v4.747h1.656l.383-2.568.384-.311h3.88V15.82l-.408.38-1.56.12V18h7.174v-1.68l-1.56-.12-.407-.38V3.868h3.879l.36.311.407 2.568h1.656V2z" fill-rule="evenodd"></path></svg>');
        $('.ql-header[value="4"]').html('<svg class="svgIcon-use" width="21" height="21"><path d="M4 5.5v4.74h1.657l.384-2.569.384-.312h2.733v8.461l-.41.38-1.91.12V18h7.179v-1.68l-1.912-.12-.405-.38V7.359h2.729l.36.312.408 2.57h1.657V5.5z" fill-rule="evenodd"></path></svg>');
        $('.ql-blockquote').html('<svg class="svgIcon-use" width="21" height="21" data-multipart="true"><path d="M15.48 18.024c-2.603 0-4.45-2.172-4.45-4.778 0-3.263 2.498-6.3 6.517-8.803l1.297 1.303c-2.497 1.63-3.91 3.042-3.91 5.214 0 2.824 3.91 3.582 3.91 3.91.11 1.41-1.194 3.15-3.366 3.15h.004v.004z"></path><path d="M6.578 18.024c-2.606 0-4.453-2.172-4.453-4.778 0-3.263 2.497-6.3 6.515-8.803l1.303 1.303c-2.606 1.63-3.907 3.042-3.907 5.106 0 2.823 3.91 3.58 3.91 3.91 0 1.518-1.304 3.257-3.368 3.257z"></path></svg>');
    } 

    private getLineFromIndex(index: number): number {
        const line = this.quill?.getLine(index);
        if (line) {
            return this.quill?.getIndex(line[0]) || 0;
        }
        return 0;
    }

    private getLineFromBlot(blot: any): number {
        try {
            return this.quill?.getIndex(blot) || 0;
        } catch (error) {
            return 0;
        }
    }

    private isLink(str: string) {
        const linkRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
        return linkRegex.test(str);
    }

    private getVideoUrl(url: string) {
        let match = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/) ||
            url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/) ||
            url.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/);
        if (match && match[2].length === 11) {
            return ('https') + '://www.youtube.com/embed/' + match[2] + '?showinfo=0';
        }
        if (match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/)) { // eslint-disable-line no-cond-assign
            return (match[1] || 'https') + '://player.vimeo.com/video/' + match[2] + '/';
        }
        return null;
    }

    private isEmptyLine(index: number): boolean {
        const block = this.quill?.getLine(index)[0];
        if (!block) {
            return false;
        }
        try {
            if (block.cache.length === 1) {
                return true;
            } else if (block.cache.delta.ops[0].insert === 'Tell your story...') {
                return true;
            }
            else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    public onPhotoFileChange(event: any) {
        const file = event.srcElement.files[0];
        if (!file) {
            return;
        }
    
        // Create a new FileReader
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader?.result === 'string') {
                const base64String = reader?.result?.split(',')[1];
                const src = 'data:image/png;base64,' + base64String;
                const index = this.quill?.getSelection()?.index;
                this.quill?.insertEmbed(index ? index : 0, 'image', src);
                this.quill?.updateContents(new Delta()
                    .retain(index? index + 1 : 0)
                    .insert('\n')
                );
                this.quill?.setSelection(index ? index + 2 : 0, 0);
            }
        };

        event.srcElement.value = '';

        reader.readAsDataURL(file);
    }

    public handleInsertVideoClick() {
        const index = this.quill?.getSelection()?.index || 0;
        this.quill?.updateContents(new Delta()
            .retain(index)
            .insert('Paste a YouTube, Vimeo, or other video link', {color: '#b3b3b1'}));
        this.enableVideoInsert = true;
        this.videoInsertIndex = index;
        $('.close-toolbar-button').css({display: 'none'});
        $('#toolbar2').css({display: 'none'});
        $('.open-toolbar-button').css({display: 'none'});
    }

    public handleInsertCodeClick(event: any) {
        console.log('handleInsertCodeClick: ', event);
        const {index, length} = this.quill?.getSelection() || {index: null, length: null};
        if (index !== null && length !== null) {
            this.quill?.insertText(index, '\n');
            this.quill?.setSelection(index, length);
            this.quill?.format('code-block', true);
        }
        $('.close-toolbar-button').css({display: 'none'});
        $('#toolbar2').css({display: 'none'});
        $('.open-toolbar-button').css({display: 'none'});
    }

    public handleOpenToolBarClick() {
        const index = this.quill?.getSelection()?.index
        if (index !== undefined && typeof index === 'number') {
            const bounds = this.quill?.getBounds(index);
            const top = (bounds?.top || 0) + ($('.ql-editor').offset()?.top || 0) - 77;
            const left = (bounds?.left || 0) + ($('.ql-editor').offset()?.left || 0) - 70;
            $('.open-toolbar-button').css({display: 'none'});
            $('#toolbar2').css({
                display: 'block',
                top: `${top}px`,
                left: `${left + 50}px`,
            })
            $('.close-toolbar-button').css({
                display: 'block',
                top: `${top}px`,
                left: `${left}px`,
            })
        }
        if (this.emptyContent) {
            this.emptyContent = false;
            this.quill?.updateContents(new Delta()
                .retain(this.getLineFromBlot(this.headBlot))
                .retain(0, {color: 'rgba(0,0,0,.84)'})
                .delete(18), 'silent'
            );
        }
    }

    public handleCloseToolBarClick() {
        $('.close-toolbar-button').css({display: 'none'});
        $('#toolbar2').css({display: 'none'});
        $('.open-toolbar-button').css({display: 'none'});
    }
}
