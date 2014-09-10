/**
 * Created by Fred on 14年7月4日.
 */

var ApplicationItemList = Parse.Collection.extend({

    // Reference to this collection's model.
    model: ApplicationItem,
    // Todos are sorted by their original insertion order.
    comparator: function(todo) {
        return todo.get('order');
    }
});


var Project_Item_View = Parse.View.extend({

    // Delegated events for creating new items, and clearing completed ones.
    events: {
       "click .project_item": "loadView"
    },
//
    initialize: function() {
        var self = this;
        _.bindAll(this, 'loadView', 'render');
        this.$el.html((_.template($("#management-form-template").html())));
    },
    loadView: function() {
        console.log("load view");
        managementView.load(this.model);
    },
//    // Re-render the contents of the todo item.
    render: function() {
        var project_item_template =  _.template($('#project_item_template').html())
        $(this.el).html(project_item_template(this.model.toJSON()));
        return this;
    }
});

var app_item_temp;
var ManagementView = Parse.View.extend({

//    project_detail_template:  _.template($('#project_detail_template').html()),
    // Delegated events for creating new items, and clearing completed ones.
    events: {
        "click #saveManageButton": "saveManagement",
        "click .log-out": "logOut",
        "click #exportExcelButton": "exportExcel",
        "click #queryButton": "query"
    },

    el: ".content",

    initialize: function() {

        var self = this;
        _.bindAll(this, 'addOne', 'addAll', 'render', 'logOut', 'createOnEnter', 'saveManagement', 'load', 'exportExcel');
        this.$el.html(_.template($("#management-form-template").html()));
        this.$("#top_panel").html(_.template($("#manage_toolbar_template").html()));
//        // Create our collection of Todos
        this.applicationItemList = new ApplicationItemList;
//        // Setup the query for the collection to look for todos from the current user
        this.applicationItemList.query = new Parse.Query(ApplicationItem);

        this.applicationItemList.bind('add',     this.addOne);
        this.applicationItemList.bind('reset',   this.addAll);
        this.applicationItemList.bind('all',     this.render);

//        // Fetch all the todo items for this user
        this.applicationItemList.fetch();
    },

    exportExcel: function(e) {
        console.log(e);
//        return ExcellentExport.excel(e.currentTarget, 'datatable' , 'data');

        myList = [];
        this.applicationItemList.each(function(model) {
                myList.push(model.toJSON());
            }
        );


        buildHtmlTable();
        return ExcellentExport.excel(e.currentTarget, 'excelDataTable' , 'data');
    },

    // Logs out the user and shows the login view
    logOut: function(e) {
        Parse.User.logOut();
        new LogInView();
        this.undelegateEvents();
        delete this;
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
    },


    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(ApplicationItem) {
        var view = new Project_Item_View({model: ApplicationItem});
        this.$("#left_panel").append(view.render().el);
        console.log("TTxx4" + _.pairs(ApplicationItem) + ApplicationItem.attributes);

    },

    // Add all items in the Todos collection at once.
    addAll: function(collection, filter) {
        this.$("#left_panel").html("");

        this.applicationItemList.each(this.addOne);
    },

    // If you hit return in the main input field, create new Todo model
    createOnEnter: function(e) {
    },

    query: function() {
        var queryText = $("#queryText").val();
        var queryOption = $("#queryOption :selected").val();

        this.applicationItemList.query = new Parse.Query(ApplicationItem);
        this.applicationItemList.query.equalTo(queryOption, queryText);
        this.applicationItemList.fetch();
        console.log(queryText + " : " + queryOption);
    },

    saveManagement: function() {

        //New
        var admin_project_number = $("#admin_project_number").val();
        var admin_project_funded = $("#admin_project_funded").is(':checked');
        var admin_project_y1_amount = $("#admin_project_y1_amount").val();
        var admin_project_y1_check_no = $("#admin_project_y1_check_no").val();
        app_item_temp.set("admin_project_number", admin_project_number);
        app_item_temp.set("admin_project_funded", admin_project_funded);
        app_item_temp.set("admin_project_y1_amount", admin_project_y1_amount);
        app_item_temp.set("admin_project_y1_check_no", admin_project_y1_check_no);

        console.log(admin_project_number + admin_project_funded + admin_project_y1_amount + admin_project_y1_check_no);
        //repeated except user
        var v_project_catagory = $('input[name="project_catagory"]:checked').val();
        var v_project_title = $("#project_title").val();
        var v_project_leader_title = $("#project_leader_title :selected").val();
        var v_project_leader_surname = $("#project_leader_surname").val();
        var v_project_leader_forename = $("#project_leader_forename").val();
        console.log(v_project_catagory + v_project_title + v_project_leader_title + v_project_leader_surname +  v_project_leader_forename);
        app_item_temp.set("project_catagory", v_project_catagory);
        app_item_temp.set("project_title", v_project_title);
        app_item_temp.set("project_leader_title", v_project_leader_title);
        app_item_temp.set("project_leader_surname", v_project_leader_surname);
        app_item_temp.set("project_leader_forename", v_project_leader_forename);
//        app_item_temp.set("user", Parse.User.current().id);
        app_item_temp.save(null, {
            success: function(app_item) {
                console.log('New object created with objectId: ' + app_item.id);
            },
            error: function(app_item, error) {
                console.log('Failed to create new object, with error code: ' + error.message);
            }
        });
    },


    load: function(model) {
        app_item_temp = model;
        console.log("XXXXXXXXXX" + model.toJSON());

        var project_detail_template =  _.template($('#project_detail_template').html());
        $("#right_panel").html(project_detail_template(model.toJSON()));

        var project_catagory = model.get("project_catagory");
        _.each($('input[name=project_catagory]'), function(elements){
            console.log($(elements).val());
            if ($(elements).val() == project_catagory) {
                $(elements).attr('checked', 'checked');
            }
        });
        var project_leader_title = model.get("project_leader_title");
        console.log(project_catagory + " : " + project_leader_title);
        $('#project_leader_title option')[project_leader_title].selected = true;
    }
});


var myList = [];
// Builds the HTML Table out of myList.
function buildHtmlTable() {
    var columns = addAllColumnHeaders(myList);

    for (var i = 0 ; i < myList.length ; i++) {
        var row$ = $('<tr/>');
        for (var colIndex = 0 ; colIndex < columns.length ; colIndex++) {
            var cellValue = myList[i][columns[colIndex]];

            if (cellValue == null) { cellValue = ""; }

            row$.append($('<td/>').html(cellValue));
        }
        $("#excelDataTable").append(row$);
    }
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records
function addAllColumnHeaders(myList)
{
    var columnSet = [];
    var headerTr$ = $('<tr/>');
    for (var i = 0 ; i < myList.length ; i++) {
        var rowHash = myList[i];
        for (var key in rowHash) {
            if ($.inArray(key, columnSet) == -1){
                columnSet.push(key);
                headerTr$.append($('<th/>').html(key));
            }
        }
    }
    $("#excelDataTable").append(headerTr$);
    return columnSet;
}