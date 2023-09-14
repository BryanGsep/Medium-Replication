import { Component, OnInit } from '@angular/core';
import Quill from 'quill';
const Delta = Quill.import('delta');
import * as $ from 'jquery';

@Component({
    selector: 'app-writing-content',
    templateUrl: './writing-content.component.html',
    styleUrls: ['./writing-content.component.scss']
})
export class WritingContentComponent implements OnInit {
    quill: Quill | undefined;
    videoInsertIndex: any = null; 
    enableVideoInsert = false;

    ngOnInit() {
        this.quill = new Quill('#editor', {
            theme: 'bubble',
            modules: {
                syntax: true,
                toolbar: '#toolbar1'
            }
        });

        this.quill.on('selection-change', (range) => {
            if (!range) {
                return;
            }
            const { index, length } = range;
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

            if (range !== null) {
                const bounds = this.quill?.getBounds(index, length);
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
            }
        });

        this.quill.on('text-change', (delta) => {
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

                if (insertString && this.isLink(insertString)) {
                    this.quill?.updateContents(new Delta()
                        .retain(this.videoInsertIndex)
                        .delete(43 + insertString.length)
                    );
                    const url = this.getVideoUrl(insertString);
                    if (url) {
                        this.quill?.insertEmbed(this.videoInsertIndex, 'video', url);
                    }
                } else {
                    this.quill?.updateContents(new Delta()
                        .retain(this.videoInsertIndex)
                        .retain(insertString.length, {color: 'black'})
                        .delete(43)
                    );
                }
            }
        })

        this.quill.setSelection(0, 0);
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
        if (block.cache.length === 1) {
            return true;
        } else {
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
                this.quill?.insertEmbed(index || 0, 'image', src);
                this.quill?.setSelection(index || 0 + 1, 0);
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
    }

    public handleCloseToolBarClick() {
        $('.close-toolbar-button').css({display: 'none'});
        $('#toolbar2').css({display: 'none'});
        $('.open-toolbar-button').css({display: 'none'});
    }
}
