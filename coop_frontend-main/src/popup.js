import './popup.css';

let activePopup = null;
export function showPopup(message) { return openPopup(message, false); }
export function askPopup(message) { return openPopup(message, true); }
function openPopup(message, isConfirm) {
  return new Promise(resolve => {
    if (activePopup) activePopup(false);
    const overlay = document.createElement('div');
    overlay.className = 'coop-popup-overlay';
    const msg = String(message ?? '');
    const isError = /ผิดพลาด|ไม่สำเร็จ|ไม่สามารถ|ไม่พบ|กรุณา|ล้มเหลว|error/i.test(msg);
    const type = isConfirm ? 'question' : isError ? 'error' : 'success';
    const icon = type === 'success' ? '✓' : type === 'error' ? '!' : '?';
    const title = isConfirm ? 'ยืนยันการดำเนินการ' : isError ? 'แจ้งเตือน' : 'ดำเนินการสำเร็จ';
    overlay.innerHTML = `<div class="coop-popup-card" role="alertdialog" aria-modal="true" aria-labelledby="coop-popup-title" aria-describedby="coop-popup-message"><div class="coop-popup-icon ${type}">${icon}</div><h2 id="coop-popup-title">${title}</h2><p id="coop-popup-message"></p><div class="coop-popup-actions"></div></div>`;
    overlay.querySelector('#coop-popup-message').textContent = msg;
    const actions = overlay.querySelector('.coop-popup-actions');
    let done = false;
    const close = (value) => { if (done) return; done = true; document.removeEventListener('keydown', keyHandler); overlay.remove(); activePopup = null; resolve(value); };
    activePopup = close;
    const keyHandler = e => { if (e.key === 'Escape') close(false); if (e.key === 'Tab') { e.preventDefault(); const buttons = [...actions.querySelectorAll('button')]; const index = buttons.indexOf(document.activeElement); buttons[(index + (e.shiftKey ? buttons.length - 1 : 1)) % buttons.length].focus(); } };
    if (isConfirm) {
      const cancel = document.createElement('button'); cancel.className = 'coop-popup-cancel'; cancel.textContent = 'ยกเลิก'; cancel.onclick = () => close(false); actions.appendChild(cancel);
    }
    const ok = document.createElement('button'); ok.className = 'coop-popup-ok'; ok.textContent = isConfirm ? 'ยืนยัน' : 'ตกลง'; ok.onclick = () => close(true); actions.appendChild(ok);
    overlay.addEventListener('click', e => { if (e.target === overlay && !isConfirm) close(false); });
    document.body.appendChild(overlay); document.addEventListener('keydown', keyHandler); ok.focus();
  });
}
