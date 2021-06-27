// ==UserScript==
// @name         네이버 블로그 오디오 리더
// @namespace    https://tampermonkey.myso.kr/
// @version      1.0.0
// @updateURL    https://github.com/myso-kr/kr.myso.tampermonkey/raw/master/service/com.naver.blog-read.contents.voice.user.js
// @description  네이버 블로그의 글을 소리내어 읽어줍니다.
// @author       Won Choi
// @match        *://blog.naver.com/PostView*
// @match        *://blog.naver.com/PostList*
// @grant        GM_addStyle
// @require      https://tampermonkey.myso.kr/assets/vendor/gm-app.js
// @require      https://tampermonkey.myso.kr/assets/vendor/gm-add-style.js
// @require      https://tampermonkey.myso.kr/assets/vendor/gm-add-script.js
// @require      https://tampermonkey.myso.kr/assets/vendor/gm-speech-tts.js?v=2
// @require      https://tampermonkey.myso.kr/assets/donation.js?v=210613
// @require      https://tampermonkey.myso.kr/assets/lib/smart-editor-one.js?v=21
// @require      https://tampermonkey.myso.kr/assets/lib/naver-blog.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuidv4.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.7.2/bluebird.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js
// ==/UserScript==
// ---------------------
GM_App(async function main() {
    GM_donation('#viewTypeSelector, #postListBody, #wrap_blog_rabbit, #writeTopArea, #editor_frame', 0);
    GM_addStyle(``);
    function handler(event) {
        const wrappers = Array.from(document.querySelectorAll('[data-post-editor-version]'));
        wrappers.map((wrapper) => {
            const menu = wrapper.querySelector('.lyr_overflow_menu'); if(!menu) return;
            const item = menu.querySelector('a._readVoice') || document.createElement('a'); item.classList.add('_readVoice'); item.href = '#'; menu.prepend(item);
            item.innerText = '오디오 블로그';
            item.onclick = async function(event) {
                event.preventDefault();
                if(GM_speechState()) return GM_speechReset();
                const se = SE_parse(wrapper); if(!se || !se.content) return synth.speech('본문 정보를 인식 할 수 없습니다.');
                for(let item of se.sections) {
                    if(item.type == 'title') {
                        for(let text of item.text) await GM_speech(text);
                    }
                    if(item.type == 'text') {
                        for(let text of item.text) await GM_speech(text);
                    }
                    if(item.type == 'image') {
                        for(let text of item.description) await GM_speech(`첨부된 이미지에 대한 설명입니다. ${text}.`);
                    }
                    if(item.type == 'video') {
                        await GM_speech('첨부된 영상에 대한 설명입니다.');
                        for(let text of item.title) await GM_speech(text);
                        for(let text of item.description) await GM_speech(text);
                    }
                    if(item.type == 'line') {
                        await GM_speech('잠시 후 네이버 블로그 오디오 리더가 이어서 재생됩니다.', 5000);
                    }
                    if(item.type == 'sticker') {}
                    if(item.type == 'quotation') {
                        for(let text of item.title) await GM_speech(text);
                        for(let text of item.description) await GM_speech(text);
                    }
                    if(item.type == 'places') {
                        for(let location of item.location) {
                            const items = _.zip(location.name, location.addr);
                            for(let item of items) await GM_speech(`첨부된 장소 ${item[0]}의 주소는 ${item[1]}입니다.`);
                        }
                    }
                    if(item.type == 'link') {
                        const items = _.zip(item.title, item.description, item.hostname);
                        for(let item of items) {
                            await GM_speech(`첨부된 웹문서 "${item[0]}"에 대한 설명입니다. ${item[1]}. 이 웹문서는 ${item[2]} 웹사이트로 이동합니다.`);
                        }
                    }
                    if(item.type == 'file') {
                        for(let text of item.name) await GM_speech(`${text} 파일이 첨부되어 있습니다.`);
                    }
                    if(item.type == 'schedule') {
                        await GM_speech('네이버 블로그 오디오 리더가 지원하지 않는 일정이 포함되어 있습니다.', 3000);
                    }
                    if(item.type == 'table' && item.table) {
                        await GM_speech('네이버 블로그 오디오 리더가 지원하지 않는, 표가 포함되어 있습니다.', 3000);
                    }
                    if(item.type == 'code') {
                        await GM_speech('네이버 블로그 오디오 리더가 지원하지 않는, 코드 내용이 포함되어 있습니다.', 3000);
                    }
                    if(item.type == 'formula') {
                        await GM_speech('네이버 블로그 오디오 리더가 지원하지 않는, 수식 정보가 포함되어 있습니다.', 3000);
                    }
                    if(item.type == 'talktalk') {
                        await GM_speech('궁금할 땐 네이버 톡톡하세요!');
                    }
                    if(item.type == 'material') {
                        await GM_speech('네이버 블로그 오디오 리더가 지원하지 않는, 글감 정보가 포함되어 있습니다.', 3000);
                    }
                }
                await GM_speech('이상. 모든 글의 읽기가 완료되었습니다.', 1000);
                await GM_speech('네이버 블로그 오디오 리더가 마음에 드셨다면, 개발자 최원을 후원해주세요. 이용해 주셔서 감사합니다.');
                await GM_speechReset();
            }
        });
    }
    window.addEventListener('keyup', handler, false);
    window.addEventListener('keydown', handler, false);
    window.addEventListener('keypress', handler, false);
    window.addEventListener('click', handler, false);
    handler();
});