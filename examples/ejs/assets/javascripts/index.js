document.getElementById("about").addEventListener("click", function() {
    location.href = `ejs:///about{
        "viewData": {
            "msg": "About"
        },
        "viewOptions": {

        }
    }`
})