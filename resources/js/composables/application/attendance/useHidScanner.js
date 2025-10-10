import { ref, nextTick } from 'vue';

export default function useHidScanner({ onScan, onEscape }) {
    const armed = ref(true);
    const pauseRemaining = ref(0);
    const clickThrough = ref(false);
    const shieldRef = ref(null);

    const buffer = ref('');
    let lastTick = 0;
    let idleTimer = null;
    let pauseTimer = null;

    function onKey(e){
        // Escape: stop (or bubble to page to go back if desired)
        if (e.key === 'Escape'){ toggleArm(); onEscape?.(); return; }

        const GAP = 120;
        const isDigit = /^\d$/.test(e.key);
        const isEnter = e.key === 'Enter';

        const t = performance.now();
        if (!lastTick || t - lastTick > GAP * 3) buffer.value = '';
        lastTick = t;

        if (isDigit) buffer.value += e.key;

        clearTimeout(idleTimer);
        idleTimer = setTimeout(async () => {
            if (buffer.value) {
                const final = buffer.value; buffer.value = '';
                await onScan?.(final);
            }
        }, GAP * 4);

        if (isEnter){
            clearTimeout(idleTimer);
            const final = buffer.value; buffer.value = '';
            if (final) onScan?.(final);
        }
    }

    function toggleArm(){
        armed.value = !armed.value;
        buffer.value = '';
        if (armed.value){
            pauseRemaining.value = 0;
            clickThrough.value = false;
            nextTick(()=> shieldRef.value?.focus?.());
        }
    }

    function quickPause(seconds = 8){
        if (!armed.value) return;
        pauseRemaining.value = seconds;
        clearInterval(pauseTimer);
        pauseTimer = setInterval(() => {
            pauseRemaining.value -= 1;
            if (pauseRemaining.value <= 0){
                clearInterval(pauseTimer);
                pauseTimer = null;
                pauseRemaining.value = 0;
                clickThrough.value = false;
                nextTick(() => shieldRef.value?.focus?.());
            }
        }, 1000);
    }

    function globalKeyDown(ev){
        if (!armed.value || pauseRemaining.value) return;
        if (ev.key === 'Control' || ev.metaKey) clickThrough.value = true;
        if (/^\d$/.test(ev.key) || ev.key === 'Enter'){
            ev.preventDefault(); ev.stopPropagation();
            onKey(ev);
        }
        if (ev.key === 'Escape'){
            ev.preventDefault(); ev.stopPropagation();
            toggleArm();
            onEscape?.();
        }
    }
    function globalKeyUp(){
        clickThrough.value = false;
    }
    function attachGlobal(){
        document.addEventListener('keydown', globalKeyDown, true);
        document.addEventListener('keyup',   globalKeyUp,   true);
    }
    function detachGlobal(){
        document.removeEventListener('keydown', globalKeyDown, true);
        document.removeEventListener('keyup',   globalKeyUp,   true);
    }

    return {
        armed, pauseRemaining, clickThrough, shieldRef,
        onKey, toggleArm, quickPause, attachGlobal, detachGlobal
    };
}
