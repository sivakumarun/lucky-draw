import{a as I,V as y,C as h}from"./api-XB51Jzmp.js";const i=document.getElementById("registrationForm"),d=document.getElementById("employeeId"),m=document.getElementById("employeeName"),c=document.getElementById("atmLocation"),p=document.getElementById("enrollBtn"),g=document.getElementById("loading"),o=document.getElementById("successModal"),L=document.getElementById("closeModalBtn");document.getElementById("ticketNumber");function b(){h.ATM_LOCATIONS.forEach(e=>{const t=document.createElement("option");t.value=e.value,t.textContent=e.label,c.appendChild(t)})}function E(e){return y.EMPLOYEE_ID.test(e)}function v(e){return y.EMPLOYEE_NAME.test(e)}function a(e,t,n){const r=document.getElementById(t);e.classList.add("error"),r.textContent=n,r.classList.add("show")}function u(e,t){const n=document.getElementById(t);e.classList.remove("error"),n.classList.remove("show")}d.addEventListener("input",e=>{e.target.value=e.target.value.replace(/\D/g,""),e.target.value&&!E(e.target.value)?a(e.target,"employeeIdError","SSO ID must be exactly 9 digits"):u(e.target,"employeeIdError")});m.addEventListener("input",e=>{e.target.value=e.target.value.replace(/[^A-Za-z\s]/g,""),e.target.value&&!v(e.target.value)?a(e.target,"employeeNameError","Name should only contain letters and spaces"):u(e.target,"employeeNameError")});c.addEventListener("change",e=>{e.target.value&&u(e.target,"atmLocationError")});function B(e){const t=o.querySelector(".success-content");t.innerHTML=`
    <div class="success-icon" style="color: #ffc107;">⚠️</div>
    <h2 style="color: #856404;">Already Enrolled!</h2>
    <p>SSO ID <strong>${e.employeeId||"this ID"}</strong> is already Enrolled.</p>
    <p style="margin-top: 10px;">Your Lucky Draw Coupon number is:</p>
    <div class="ticket-number" style="color: #ffc107;">${e.ticketNumber}</div>
    <p style="font-size: 14px; color: #666; margin-top: 10px;">
      <strong>Name:</strong> ${e.employeeName}<br>
      <strong>ATM:</strong> ${e.atmLocation}<br>

    </p>
    <p style="margin-top: 15px; color: #856404;">
      You cannot register again with the same SSO ID.
    </p>
    <button class="btn-close" id="closeModalBtn" style="background: #ffc107; margin-top: 20px;">Close</button>
  `,o.classList.add("show"),document.getElementById("closeModalBtn").addEventListener("click",()=>{o.classList.remove("show"),f()})}function M(e){const t=o.querySelector(".success-content");t.innerHTML=`
    <div class="success-icon">🎊</div>
    <h2>Registration Successful!</h2>
    <p>Your Coupon number is:</p>
    <div class="ticket-number">${e}</div>
    <p>Good luck with the draw!</p>
    <button class="btn-close" id="closeModalBtn">Close</button>
  `,o.classList.add("show"),document.getElementById("closeModalBtn").addEventListener("click",()=>{o.classList.remove("show"),f()})}function f(){const e=o.querySelector(".success-content");e.innerHTML=`
    <div class="success-icon">🎊</div>
    <h2>Registration Successful!</h2>
    <p>Your Coupon number is:</p>
    <div class="ticket-number" id="ticketNumber">---</div>
    <p>Good luck with the draw!</p>
    <button class="btn-close" id="closeModalBtn">Close</button>
  `}i.addEventListener("submit",async e=>{e.preventDefault();const t=d.value.trim(),n=m.value.trim(),r=c.value;let l=!0;if(E(t)||(a(d,"employeeIdError","SSO ID must be exactly 9 digits"),l=!1),v(n)||(a(m,"employeeNameError","Name should only contain letters and spaces"),l=!1),r||(a(c,"atmLocationError","Please select an ATM Name"),l=!1),!!l){p.disabled=!0,g.classList.add("show");try{const s=await I.registerTrainer(t,n,r);s.success?(M(s.ticketNumber),i.reset()):s.alreadyRegistered?(B({...s,employeeId:t}),i.reset()):alert(s.message||"Registration failed. Please try again.")}catch(s){console.error("Error:",s),alert("An error occurred. Please check your internet connection and try again.")}finally{p.disabled=!1,g.classList.remove("show")}}});L.addEventListener("click",()=>{o.classList.remove("show")});b();
