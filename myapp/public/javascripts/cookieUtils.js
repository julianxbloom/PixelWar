function getCookie(name) {
    // Permet de récupérer la valeur de notre cookie qui a le nom : name
    const value = document.cookie.split("; ").find(ele => ele.startsWith(name + "=")); 
    return value ? value.split("=")[1] : none;  // Si le cookie existe, retourne la valeur sinon retourne none
}

module.exports = {
    getCookie
};