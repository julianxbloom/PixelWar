var link = document.createElement("link");
link.type = 'text/css';
link.rel = 'stylesheet';

if (screen.width > 600)
{
    document.head.appendChild(link);
    link.href = 'stylesheets/styleWaiting.css';
}
else {
    document.head.appendChild(link);
    link.href = 'stylesheets/styleWaitingTel.css';
}