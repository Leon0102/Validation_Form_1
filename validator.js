// Hàm Validator/ Đối tượng Validator
function Validator(options){

    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){  
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    // Hàm thực hiện validate
    function validate(inputElement,rule){
        // Lấy parentElement theo thẻ gần nhất
        // var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        
        // Lấy parentElement trong trường hợp lồng nhiều thẻ cha
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);

        // var errMessage = rule.test(inputElement.value);
        var errMessage;

        // Lấy ra các rules của selector
        var rules =selectorRules[rule.selector];

        // Lặp qua từng rule & kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; i++){ 

            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errMessage =rules[i](inputElement.value);
            }
            if(errMessage) break;
        }
            if(errMessage) {
                errorElement.innerText =errMessage;
                // inputElement.parentElement.classList.add('invalid');
                getParent(inputElement,options.formGroupSelector).classList.add('invalid');
            }else{
                errorElement.innerText= '';
                // inputElement.parentElement.classList.remove('invalid');
                getParent(inputElement,options.formGroupSelector).classList.remove('invalid');

            }
        return !errMessage;
    }
    
    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    if(formElement) {

        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input,...)
        options.rules.forEach(rule => {

            // Lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }
            else{
                selectorRules[rule.selector] = [rule.test];
            }
            // --------------------------------------------

            // var inputElement = formElement.querySelector(rule.selector);
            // console.log(rule.selector);
            // console.log(inputElement)
            // if(inputElement) {
            //     // Xử lý blur ra khỏi input
            //     inputElement.onblur= function(){
            //         // value: inputElement.value
            //         // test func : rule.test
            //         validate(inputElement, rule)
            //     }
            //     // Xử lý khi nhập input
            //     inputElement.oninput=function(){
            //         var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
            //         errorElement.innerText= '';
            //         getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
            //     }
            // }

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function(inputElement){
                if(inputElement) {
                // Xử lý blur ra khỏi input
                inputElement.onblur= function(){
                    // value: inputElement.value
                    // test func : rule.test
                    validate(inputElement, rule)
                }
                // Xử lý khi nhập input
                inputElement.oninput=function(){
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText= '';
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
                }
            }
            })


        });

        // console.log(selectorRules)

        
          // Khi submit form
        formElement.onsubmit = function(e){
            e.preventDefault();

            var isFormsValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid =validate(inputElement, rule);
                if(!isValid){
                    isFormsValid = false;
                }
            });

            if(isFormsValid){
                // Trường hợp submit với JavaScript
                if(typeof options.onSubmit ==='function'){

                var enableInputs = formElement.querySelectorAll('[name]'); //:not([disabled])
                // disabled là những trường không cho nhập  

                var formValues = Array.from(enableInputs).reduce(function(values, input){
                    // Nếu có một input.value không có giá trị => return {}
                    // return (values[input.name] = input.value) && values;
                    // values[input.name] = input.value;
                    // return values;
                    // Fix bug những trường hợp ko nhập trường ko bắt buộc
                    // ---------TH không có radio -------------------

                    switch(input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="'+input.name+'"]:checked').value;
                            break;
                        case 'checkbox':
                            if(input.matches(':checked')){
                                // values[input.name] = ''; // trường hợp vẫn có value của check box trả về với giá trị '';
                                return values;
                            }
                            if(!Array.isArray(input.name)){
                                values[input.name] = [];
                            }
                            values[input.name].push(input.value);
                            break;
                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }
                    return values;
                    // ---------TH có radio----------------------------

                },{});

                options.onSubmit(formValues);
                
                }
            }
            // Trường hợp submit với hành vi mặc định
            // else{
            //     formElement.submit();
            // }
        }


    }
}


// Định nghĩa các rule
// Nguyên tắc của rules :
// 1. Có lỗi  => trả ra message lỗi
// 2. Khi hợp lệ => không trả ra gì (undefined)
Validator.isRequired = function(selector,option){
    return {
        selector: selector,
        test: function(value){
           if(typeof value === 'string'){
                return value.trim() ? undefined : option || 'Vui lòng nhập trường này';
            }
            return value ? undefined : option || 'Vui lòng nhập trường này';
        }
    }
}


Validator.isEmail = function(selector,option){
    return {
        selector: selector,
        test: function(value){
           var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
           return regex.test(value) ? undefined : option || 'Vui lòng nhập đúng email';
        }
    }
}

Validator.minLength = function(selector,min,option){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : option || `Vui lòng nhập tối thiếu ${min} ký tự`;
        }
    }
}

Validator.isConfirmed = function(selector,getConfirmValue,option){
    return {
        selector: selector,
        test: function(value){
           return value === getConfirmValue() ? undefined : option || 'Giá trị nhập vào không chính xác';
        }
    }
}