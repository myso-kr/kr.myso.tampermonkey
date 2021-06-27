(function(window) {
    function speechUtteranceChunker(utt, settings, callback) {
        settings = settings || {};
        var newUtt;
        var txt = (settings && settings.offset !== undefined ? utt.text.substring(settings.offset) : utt.text);
        if (utt.voice && utt.voice.voiceURI === 'native') { // Not part of the spec
            newUtt = utt;
            newUtt.text = txt;
            newUtt.addEventListener('end', function () {
                if (speechUtteranceChunker.cancel) {
                    speechUtteranceChunker.cancel = false;
                }
                if (callback !== undefined) {
                    callback();
                }
            });
        }
        else {
            var chunkLength = (settings && settings.chunkLength) || 160;
            var pattRegex = new RegExp('^[\\s\\S]{' + Math.floor(chunkLength / 2) + ',' + chunkLength + '}[.!?,]{1}|^[\\s\\S]{1,' + chunkLength + '}$|^[\\s\\S]{1,' + chunkLength + '} ');
            var chunkArr = txt.match(pattRegex);
  
            if (chunkArr == null || chunkArr[0] === undefined || chunkArr[0].length <= 2) {
                //call once all text has been spoken...
                if (callback !== undefined) {
                    callback();
                }
                return;
            }
            var chunk = chunkArr[0];
            newUtt = new SpeechSynthesisUtterance(chunk);
            var x;
            for (x in utt) {
                if (utt.hasOwnProperty(x) && x !== 'text') {
                    newUtt[x] = utt[x];
                }
            }
            newUtt.addEventListener('end', function () {
                if (speechUtteranceChunker.cancel) {
                    speechUtteranceChunker.cancel = false;
                    return;
                }
                settings.offset = settings.offset || 0;
                settings.offset += chunk.length;
                speechUtteranceChunker(utt, settings, callback);
            });
        }
        if (settings.modifier) {
            settings.modifier(newUtt);
        }
        console.log(newUtt); //IMPORTANT!! Do not remove: Logging the object out fixes some onend firing issues.
        //placing the speak invocation inside a callback fixes ordering and onend issues.
        setTimeout(function () { speechSynthesis.speak(newUtt); }, 0);
    };
    const synth = window.speechSynthesis;
    window.GM_speechState = function GM_speechState(){ return synth.speaking; }
    window.GM_speechReset = function GM_speechReset() { synth.cancel(); }
    window.GM_speech = function GM_speech(message, suffix_delay) {
        synth.cancel();
        return new Promise((resolve, reject) => {
            if(GM_speech.utterance) GM_speech.utterance.cancel = true;
            GM_speech.utterance = new SpeechSynthesisUtterance(message);
            GM_speech.utterance.onerror = reject;
            speechUtteranceChunker(utterance, { chunkLength: 90 }, resolve);
        }).then(()=>new Promise((resolve)=>setTimeout(resolve, suffix_delay)));
    }
  })(window);