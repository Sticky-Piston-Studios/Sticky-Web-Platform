const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const data = [
    {
        _id: new ObjectId("648dd88df15a948fdbbdd001"),
        Name: "Under Green Obolon",
        RestaurantIds: [
            new ObjectId("648dd88df15a948fdbbdd002"),
            new ObjectId("648dd88df15a948fdbbdd003")
        ],
        EmployeeCount: 302
    }
]

module.exports = { data };