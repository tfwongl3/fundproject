/**
 * Created by Fred on 14年7月3日.
 */
var ApplicationItem = Parse.Object.extend("ApplicationItem", {

    defaults: {
        project_catagory : "",
        project_title : "",
        project_leader_title : "",
        project_leader_surname : "project_leader_surname",
        project_leader_forename : "",
        admin_project_number : "",
        admin_project_funded : false,
        admin_project_y1_amount : "",
        admin_project_y1_check_no : ""
//        user : Parse.User.current()
    },

    // Ensure that each todo created has `content`.
    initialize: function() {
//        if (!this.get("content")) {
//            this.set({"content": this.defaults.content});
//        }
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
//        this.save({done: !this.get("done")});
    }
});

// The main view that lets a user manage their todo items
var ApplicationView = Parse.View.extend({

    app_item_temp: new ApplicationItem(),

    events: {
        "click .log-out": "logOut",
        "click #saveFormButton" : "submitForm",
        "click #printButton" : "print"
    },

    el: ".content",

    initialize: function() {
        var self = this;
        _.bindAll(this,'render', 'logOut', 'submitForm', 'print');

        var query = new Parse.Query(ApplicationItem);
        query.equalTo('user', Parse.User.current().id);

        query.find({
            success: function(results) {
                if (results.length > 0) {
                    console.log("Successfully retrieved " + results.length + " Application Forms");
                    self.render(results[0]);
                    $("#printButton").removeAttr("disabled");


                } else {
                    console.log("No Object Found");
                    self.render();
                    $("#saveFormButton").removeAttr("disabled");

                }
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });
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
    render: function(app_item) {
        if (app_item) {
            console.log("Application Item: " +  _.pairs(app_item.toJSON()));
             var app_template = _.template($("#application-form-template").html());
             this.$el.html(app_template(app_item.toJSON()));
            var project_catagory = app_item.get("project_catagory");
            _.each($('input[name=project_catagory]'), function(elements){
                console.log($(elements).val());
                if ($(elements).val() == project_catagory) {
                    $(elements).attr('checked', 'checked');
                }
            });
            var project_leader_title = app_item.get("project_leader_title");
            console.log(project_catagory + " : " + project_leader_title);
            $('#project_leader_title option')[project_leader_title].selected = true;
        } else {
            console.log("create new application item");
            console.log(this.app_item_temp);
            this.$el.html(_.template($("#application-form-template").html(), this.app_item_temp.attributes));
        }
    },

    print: function() {
        console.log("Print");
        var docDefinition = { content: 'This is an sample PDF printed with pdfMake' };
        // open the PDF in a new window
        pdfMake.createPdf(docDefinition).open();
        // print the PDF (temporarily Chrome-only)
        pdfMake.createPdf(docDefinition).print();
        // download the PDF (temporarily Chrome-only)
        pdfMake.createPdf(docDefinition).download('optionalName.pdf');
    },

    submitForm: function() {
        var v_project_catagory = $('input[name="project_catagory"]:checked').val();
        var v_project_title = $("#project_title").val();
        var v_project_leader_title = $("#project_leader_title :selected").val();
        var v_project_leader_surname = $("#project_leader_surname").val();
        var v_project_leader_forename = $("#project_leader_forename").val();
        console.log(v_project_catagory + v_project_title + v_project_leader_title + v_project_leader_surname +  v_project_leader_forename);
        this.app_item_temp.set("project_catagory", v_project_catagory);
        this.app_item_temp.set("project_title", v_project_title);
        this.app_item_temp.set("project_leader_title", v_project_leader_title);
        this.app_item_temp.set("project_leader_surname", v_project_leader_surname);
        this.app_item_temp.set("project_leader_forename", v_project_leader_forename);
        this.app_item_temp.set("user", Parse.User.current().id);
        this.app_item_temp.save(null, {
            success: function(app_item) {
                console.log('New object created with objectId: ' + app_item.id);
                $("#saveFormButton").attr("disabled", "disabled");
                $("#printButton").removeAttr("disabled");
            },
            error: function(app_item, error) {
                console.log('Failed to create new object, with error code: ' + error.message);
            }
        });
    }
});