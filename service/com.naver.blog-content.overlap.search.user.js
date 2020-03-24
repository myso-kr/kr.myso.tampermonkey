// ==UserScript==
// @name         네이버 블로그 중복문서 검색
// @namespace    https://tampermonkey.myso.kr/
// @version      1.0.0
// @updateURL    https://tampermonkey.myso.kr/service/com.naver.blog-content.overlap.search.user.js
// @description  네이버 블로그에서 내 글의 중복문서/짜집기문서를 쉽게 찾기위한 기능을 추가합니다.
// @author       Won Choi
// @match        https://blog.naver.com/PostView.nhn?*
// @grant        none
// ==/UserScript==
async function main() {
    const container = document.querySelector('.blog2_post_function');
    container.innerHTML = '<a href="#" class="url pcol2 _returnFalse _transPosition _se3overlapbtn"style="cursor:pointer; margin-right:11px;">중복문서 찾기</a>' + container.innerHTML;
    const button = container.querySelector('._se3overlapbtn');
    button.onclick = function(e) {
        e.preventDefault();
        if(confirm('해당 기능은 본문 내용 일부를 무작위로 추출하여 검색합니다. 계속하시겠습니까?')) {
            const arr = document.querySelector('.se-main-container').innerText.replace(/[\n]+/g, ' ').split(' ');
            const idx = Math.floor(Math.random() * (arr.length - 50));
            const uri = new URL('https://search.naver.com/search.naver');
            uri.searchParams.set('sm', 'tab_opt');
            uri.searchParams.set('where', 'nexearch');
            uri.searchParams.set('query', arr.slice(idx, idx + 50).join(' '));
            window.open(uri, 'overlap_search');
        }
    }
}
function checkForDOM() { return (document.head && document.body) ? main() : requestIdleCallback(checkForDOM); }
requestIdleCallback(checkForDOM);