$("#registeremail").on('change', function() {
    var email = $(this).val();
    $.ajax({
        url: '/emailtaken',
        type: 'post',
        data: { email: email },
        success: function(response) {
            $("#registeremail").val("")
            alertify.error(response);
        }
    })
})

$("#registerlastname").on('change', function() {
    var lname = $(this).val()
    var re = /^[A-Za-z]+$/;
    if (!re.test(lname)) {
        //alert('Valid Name.');
        $(this).val("")
    }
})

$("#registerfirstname").on('change', function() {
    var fname = $(this).val()
    var re = /^[A-Za-z]+$/;
    if (!re.test(fname)) {
        //alert('Valid Name.');
        $(this).val("")
    }
})

$('#addresslink').on('click', function() {
    $('#address').show();
    $('#dashboard').hide();
})

$('#dashboardlink').on('click', function() {
    $('#address').hide();
    $('#dashboard').show();
})