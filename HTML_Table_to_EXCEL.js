let name = 'Masteram_Data';
$('#button_3').on("click", ((e)=>{
    name = 'YML_Data';
}));

$('#button_2').on("click", ((e)=>{
    name = 'Masteram_Data';
}));

$('#button').on("click", (function(e){
    $("#mainTable").table2excel({
        name: "Backup file for HTML content",

        //  include extension also
        filename: `${name}.xls`,

        // 'True' is set if background and font colors preserved
        preserveColors: false
    });
}));

