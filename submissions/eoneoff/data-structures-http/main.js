/*
Data structues with html assess

    The assess to data structues is provided through html requests

    stack
        <socket>/stack

        POST request with json object of format {"data":<value to push to stack>} pushes vaule to stack

        DELETE request pops a value from a stack and returns in in json object of format
        {"data": <value popped from stack}

    linked list
        <socket>/list

        GET request returns the contents of list in a json object

        POST request with json object of format
        {
            "data": <value to insert into stack>[,
            "sucessor": <successor value>]
        }
        inserts value into list

        DELETE request with json object of format {"data":<value to remove from list>} removes
        the value from the list

        If data is not presented in json format, if it is not string or number or if a successor
        or an item to remove is not in the list a Bad Reques code is returned
*/

const { Server } = require('./server/server');
const { LinkedList } = require('./data_structures/linkedList');
const { Stack } = require('./data_structures/stack');

new Server(new Stack(), new LinkedList()).run();
