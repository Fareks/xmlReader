$('#button').on("click", (function(e){
    $("#mainTable").table2excel({
        name: "Backup file for HTML content",

        //  include extension also
        filename: "GFGFile.xls",

        // 'True' is set if background and font colors preserved
        preserveColors: false
    });
}));

