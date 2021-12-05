# functions should return json with the correct data
#   each function should be tested for all of these things:
#       no parameter
#       one valid parameter
#       one invalid parameter
#       multiple valid parameters
#       multiple parameters inc invalid
#
#   eg:
#
#   calling the users function:
#       with no parameter                   should return all users
#       with a parameter id=1               should return data for 'Bob'
#       with an invalid parameter           should return an error code 404
#       with parameters id=1, username=bob  should return data for 'Bob'

