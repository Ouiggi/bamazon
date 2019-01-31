require("dotenv").config();

var mysql = require("mysql");
var inquirer = require("inquirer")
var dataArr
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: process.env.MYSQL_PASSWORD,
    database: "bamazonDB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);

    first();

});

// first "list items to select from"

function first() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res)
        selectItem()
    });
};

function selectItem() {
    inquirer
        .prompt([
            {
                name: "pickYourItem",
                message: "Use the item ID to choose your selection.",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }, {
                name: "howMany",
                message: "Select the quantity you want.",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function (res) {
            var query = connection.query("SELECT*FROM products WHERE item_id =?", [res.pickYourItem], function (err, result) {
                console.log("Order Confirmation: " + res.howMany + " " + result[0].product_name);
                if (result[0].stock_quantity > res.howMany) {
                    var query = connection.query("UPDATE products set ? WHERE ?", [
                        {
                            stock_quantity: result[0].stock_quantity - res.howMany
                        }, {
                            item_id: res.pickYourItem
                        }], function () {
                            console.log(divider + "Your order is " + res.howMany + " " + result[0].product_name + " has been placed!");
                            console.log("Your total is :" + res.howMany * result[0].price + " USD!" + divider);
                            finalize();
                        })
                } else {
                    console.log(divider + "Unfortunately it seems there isn't enought" + result[0].product_name
                        + " to fulfill your order" + divider);
                    finalize();
                }
            })
        })
}

function finalize() {
    inquirer
        .prompt([
            {
                name: "wishToContinue",
                message: "Do you want to continue shopping?",
                type: "list",
                choices: ["YES", "NO"]
            }
        ]).then(function (res) {
            if (res.wishToContinue == "YES") {
                displayItems();
            } else {
                console.log("Thank you for shopping at Simon's bamazon");
                return;
            }
        })
}


