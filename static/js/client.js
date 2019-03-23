
var app = {};

app.variables = {
    items: []
};

app.constants = {
    url_service: "http://127.0.0.1:5000/crud",
    items_grid_id: "#items_grid",
    name_textbox_id: "#name_textbox",
    price_textbox_id: "#price_textbox",
    stock_textbox_id: "#stock_textbox"
}

app.methods = {
    'init': function(){
        app.methods.get_all();
    },
    'format_item': function(item) {
        if(item.hasOwnProperty('_id')) {
            if(item['_id'].hasOwnProperty('$oid')) {
                var item_id = item['_id']['$oid'];
                item['_id'] = item_id;
            }
        }
        return item;
    },
    'get_all': function() {
        $.ajax({
            type: "GET",
            url: app.constants.url_service + "/get_all",
            success: function (response) {
                console.log('empezando...')
                app.variables.items = JSON.parse(response.items);
                app.methods.initialize_grid();
            },
            error: function (response) { }
        });
    },
    'edit_item': function(item) {
        $.ajax({
            type: "POST",
            data: app.methods.format_item(item),
            dataType: "json",
            url: app.constants.url_service + "/update",
            success: function (response) {
                app.methods.get_all();
                alert('se actualizó un item');
            },
            error: function (response) {
                alert('ha pasado algo malo')
            }
        });
    },
    'delete_item': function(item) {
        $.ajax({
            type: "POST",
            data: app.methods.format_item(item),
            dataType: "json",
            url: app.constants.url_service + "/delete",
            success: function (response) {
                app.methods.get_all();
                alert('se eliminado un item');
            },
            error: function (response) {
                alert('ha pasado algo malo')
            }
        });
    },
    'add_item': function() {
        var name_value = $(app.constants.name_textbox_id).val();
        var price_value = $(app.constants.price_textbox_id).val();
        var stock_value = $(app.constants.stock_textbox_id).val();
        var new_item = {
            name: name_value,
            price: price_value,
            stock: stock_value
        };
        $.ajax({
            type: "POST",
            data: new_item,
            dataType: "json",
            url: app.constants.url_service + "/add",
            success: function (response) {
                app.methods.get_all();
                alert('se ha creado un nuevo item')
            },
            error: function (response) {
                alert('ha pasado algo malo')
            }
        });
    },
    'initialize_grid': function () {
        var db = {
            loadData: function (filter) {
                return $.grep(app.constants.items_grid_id, function (client) {
                    return (!filter.name || client.name.toLowerCase().indexOf(filter.name.toLowerCase()) > -1)
                        && (!filter.price || client.price.toLowerCase().indexOf(filter.price.toLowerCase()) > -1)
                        && (!filter.stock || client.stock.toLowerCase().indexOf(filter.stock.toLowerCase()) > -1);
                });
            },
            insertItem: function (insertingClient) { },
            updateItem: function (item) {
                app.methods.edit_item(item);
            },
            deleteItem: function (deletingClient) { }
        };

        $(app.constants.items_grid_id).jsGrid({
            width: "100%",
            noDataContent: "No hay items",
            filtering: true,
            inserting: false,
            editing: true,
            sorting: true,
            paging: true,
            pageIndex: 1,
            pageSize: 9,
            pageButtonCount: 15,
            pagerFormat: "Items: {first} {prev} {pages} {next} {last}    {pageIndex} de {pageCount}",
            pagePrevText: "Ant",
            pageNextText: "Siguiente ",
            pageFirstText: "1",
            pageLastText: " Último",
            pageNavigatorNextText: "...",
            pageNavigatorPrevText: "...",
            loadMessage: "Dame un minuto, estoy buscando",
            controller: db,
            fields: [
                { name: "name", title: "Nombre", type: "text", width: 30, editing: true },
                { name: "price", title: "Precio", type: "text", width: 30, editing: true },
                { name: "stock", title: "Cantidad", type: "text", width: 30, editing: true },
                {
                    type: "control",
                    width: 10,
                    deleteButton: false,
                    editButton: false,
					itemTemplate: function (value, item) {
                        var $result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments);
                        var $DeleteButton = $("<a>")
                            .text('borrar')
                            .prop('href', '#')
                            .click(function (e) {
                                app.methods.delete_item(item);
                                e.stopPropagation();
                            });
                        return $result.add($DeleteButton);
                    }
                }
            ]
        });
        $(".jsgrid-search-mode-button").click();
        $(app.constants.items_grid_id).jsGrid("option", "data", app.variables.items);
    }
}

app.methods.init();