
export function findButtonByInnerText(ns, searchText) {
    const buttonTags = document.querySelectorAll('button');

    for (const button of buttonTags) {
        if (button.innerText.includes(searchText)) {
            if (button.disabled) {
                ns.print("TOR buying button is disabled!");
                return null;
            }
            return button;
        }
    }

    return null; // Return null if no matching button is found
}


export function findSpanByAriaLabel(label) {
    const spanTags = document.querySelectorAll('span');

    for (const span of spanTags) {
        const ariaLabel = span.getAttribute('aria-label');
        if (ariaLabel === label) {
            return span;
        }
    }
    return null; // Return null if no matching span is found
}