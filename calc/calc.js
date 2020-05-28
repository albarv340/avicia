let calculatorForm = document.getElementById("calculatorForm");
let emeralds = document.getElementById("emeralds");
let emeraldsTax = document.getElementById("emeraldsTax");
let le = document.getElementById("le");
let leTax = document.getElementById("leTax");
let stacks = document.getElementById("stacks");
let stacksTax = document.getElementById("stacksTax");
let changed = false;
calculatorForm.addEventListener("submit", e => {
    e.preventDefault();
    let emeralds = document.getElementById("emeralds").value;
    let emeraldsTax = document.getElementById("emeraldsTax").value;
    let le = document.getElementById("le").value;
    let leTax = document.getElementById("leTax").value;
    let stacks = document.getElementById("stacks").value;
    let stacksTax = document.getElementById("stacksTax").value;
    if (changed) {
        if (emeralds > 0) {
            document.getElementById("emeraldsTax").value = emeralds * 1.05;
            document.getElementById("le").value = emeralds / 4096;
            document.getElementById("leTax").value = emeralds * 1.05 / 4096;
            document.getElementById("stacks").value = emeralds / (4096 * 64);
            document.getElementById("stacksTax").value = emeralds * 1.05 / (4096 * 64);
        }
        if (emeraldsTax > 0) {
            document.getElementById("emeralds").value = emeraldsTax / 1.05;
            document.getElementById("leTax").value = emeraldsTax / 4096;
            document.getElementById("le").value = emeraldsTax / 1.05 / 4096;
            document.getElementById("stacks").value = emeraldsTax / 1.05 / (4096 * 64);
            document.getElementById("stacksTax").value = emeraldsTax / (4096 * 64);
        }
        if (le > 0) {
            document.getElementById("emeraldsTax").value = le * 1.05 * 4096;
            document.getElementById("emeralds").value = le * 4096;
            document.getElementById("leTax").value = le * 1.05;
            document.getElementById("stacks").value = le / 64;
            document.getElementById("stacksTax").value = le * 1.05 / 64;
        }
        if (leTax > 0) {
            document.getElementById("emeraldsTax").value = leTax * 4096;
            document.getElementById("le").value = leTax / 1.05;
            document.getElementById("emeralds").value = leTax / 1.05 * 4096;
            document.getElementById("stacks").value = leTax / 1.05 / 64;
            document.getElementById("stacksTax").value = leTax / 64;
        }
        if (stacks > 0) {
            document.getElementById("emeraldsTax").value = stacks * 1.05 * (4096 * 64);
            document.getElementById("le").value = stacks * 64;
            document.getElementById("emeralds").value = stacks * (4096 * 64);
            document.getElementById("leTax").value = stacks * 1.05 * 64;
            document.getElementById("stacksTax").value = stacks * 1.05;
        }
        if (stacksTax > 0) {
            document.getElementById("emeraldsTax").value = stacksTax * (4096 * 64);
            document.getElementById("le").value = stacksTax / 1.05 * 64;
            document.getElementById("emeralds").value = stacksTax / 1.05 * (4096 * 64);
            document.getElementById("leTax").value = stacksTax * 64;
            document.getElementById("stacks").value = stacksTax / 1.05;
        }
    }
    changed = false;
    fancyfy(false);
    fancyfy(true);
});

emeralds.addEventListener("change", e => {
    emeraldsTax.value = "";
    le.value = "";
    leTax.value = "";
    stacks.value = "";
    stacksTax.value = "";
    changed = true;
});

emeraldsTax.addEventListener("change", e => {
    emeralds.value = "";
    le.value = "";
    leTax.value = "";
    stacks.value = "";
    stacksTax.value = "";
    changed = true;
});

le.addEventListener("change", e => {
    emeralds.value = "";
    emeraldsTax.value = "";
    leTax.value = "";
    stacks.value = "";
    stacksTax.value = "";
    changed = true;
});

leTax.addEventListener("change", e => {
    emeralds.value = "";
    emeraldsTax.value = "";
    le.value = "";
    stacks.value = "";
    stacksTax.value = "";
    changed = true;
});

stacks.addEventListener("change", e => {
    emeralds.value = "";
    emeraldsTax.value = "";
    le.value = "";
    leTax.value = "";
    stacksTax.value = "";
    changed = true;
});

stacksTax.addEventListener("change", e => {
    emeralds.value = "";
    emeraldsTax.value = "";
    le.value = "";
    leTax.value = "";
    stacks.value = "";
    changed = true;
});


async function fancyfy(tax) {
    let stacksValue = document.getElementById("stacks").value;
    let taxString = "without tax";
    if (tax) {
        stacksValue = stacksValue * 1.05;
        taxString = "with tax";
    }
    let stacks = stacksValue.toString().split(".")[0] || 0;
    let le1 = "." + stacksValue.toString().split(".")[1];
    let le2 = le1 * 64;
    let le = parseInt(le2) || 0;
    let eb1 = "." + le2.toString().split(".")[1];
    let eb2 = eb1 * 64;
    let eb = parseInt(eb2) || 0;
    let em1 = "." + eb2.toString().split(".")[1];
    let em2 = em1 * 64;
    let em = parseInt(em2.toString().split(".")[0]) || 0;
    let fancy = `${stacks} stacks ${le} le ${eb} eb ${em} emeralds ${taxString}`;
    let fancyTax = `${stacks} stacks ${le} le ${eb} eb ${em} emeralds ${taxString}`;
    if (tax) {
        document.getElementById("fancyTax").innerHTML = fancyTax;
    } else {
        document.getElementById("fancy").innerHTML = fancy;
    }
}