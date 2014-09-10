/**
 * Created by Fred on 14年7月3日.
 */

var LogInView;
var managementView;

$(function() {
    Parse.$ = jQuery;
    Parse.initialize("gETFE1YOl89P6sLR63fSFOAcqwoyizrPH2s49PjZ", "rzNbyJazouKoZyTnfWsIQWm0XsiBmE62owEp1kEP");

    LogInView = Parse.View.extend({
        events: {
            "submit form.login-form": "logIn",
            "submit form.signup-form": "signUp"
        },

        el: ".content",

        initialize: function() {
            _.bindAll(this, "logIn", "signUp");
            this.render();
        },

        logIn: function(e) {
            var self = this;
            var username = this.$("#login-username").val();
            var password = this.$("#login-password").val();
            Parse.User.logIn(username, password, {
                success: function(user) {
                    console.log("TT1");
                    if (user.get("username") != "Admin") {
                        console.log("TT2");
                        new ApplicationView();

                    } else {
                        console.log("TT3");
                        managementView = new ManagementView();
                    }
                    self.undelegateEvents();
                    delete self;
                },

                error: function(user, error) {
                    self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
                    self.$(".login-form button").removeAttr("disabled");
                }
            });

            this.$(".login-form button").attr("disabled", "disabled");

            return false;
        },

        signUp: function(e) {
            var self = this;
            var username = this.$("#signup-username").val();
            var password = this.$("#signup-password").val();

            Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
                success: function(user) {
                    new ApplicationView();
                    self.undelegateEvents();
                    delete self;
                },

                error: function(user, error) {
                    self.$(".signup-form .error").html(error.message).show();
                    self.$(".signup-form button").removeAttr("disabled");
                }
            });

            this.$(".signup-form button").attr("disabled", "disabled");

            return false;
        },

        render: function() {
            this.$el.html(_.template($("#login-template").html()));
            this.delegateEvents();
        }
    });



    // The main view for the app
    var AppView = Parse.View.extend({
        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("#todoapp"),

        initialize: function() {
            this.render();
        },

        render: function() {
            if (Parse.User.current()) {
                if (Parse.User.current().get("username") != "Admin") {
                    new ApplicationView();
                } else {
                    managementView = new ManagementView();
                }
            } else {
                new LogInView();
            }
        }
    });

    var AppState = Parse.Object.extend("AppState", {
            default : {
                filter: "completed"
            }
        }
    )

    var AppRouter = Parse.Router.extend({
        routes: {
            "all": "all",
            "active": "active",
            "completed": "completed"
        },

        initialize: function(options) {
        },

        all: function() {
            state.set({ filter: "all" });
        },

        active: function() {
            state.set({ filter: "active" });
        },

        completed: function() {
            state.set({ filter: "completed" });
        }
    });
    var state = new AppState;
    new AppRouter;
    new AppView;
    Parse.history.start();

});