// Edit toggle for editing review
$('.edit-toggle-form').on('click', function(){
    $(this).text() === 'Edit' ? $(this).text('Cancel') : $(this).text('Edit');
    $(this).siblings('.edit-review-form').toggle();
});

// Adding click listener for clearing  of rating from edit/new form
$('.clear-rating').click(function(){
    $(this).siblings('.input-no-rate').click();
});