const funcsBirthDate = {
  init: () => {
      const userData = vtexjs.checkout.orderForm.clientProfileData;
      //EXISTE DUAS POSSIBILIDADES DE USUÁRIOS LOGADOS
      //1° TEM DADOS SALVOS MAS NÃO ESTÁ CONECTADO
      //2° TEM DADOS SALVOS E ESTÁ CONECTADO
      //3° NÃO TEM DADOS SALVOS

      //VERIFICAÇÃO SE EXISTE DADOS DO USUÁRIO
      if (userData !== null) {
          if (userData.document !== null && userData.document.split('*').length > 1 ||
              userData.firstName !== null && userData.firstName.split('*').length > 1 ||
              userData.phone !== null && userData.phone.split('*').length > 1) {
              //1°
              funcsBirthDate.checKIfHaveBirthDate(1);
          } else {
              //2°
              funcsBirthDate.checKIfHaveBirthDate(2);
          }
      } else {
          //3°
          funcsBirthDate.checKIfHaveBirthDate(3);
      }
  },
  checKIfHaveBirthDate: function (option) {
      funcsBirthDate.addFieldBirthDate('');
      vtexjs.checkout.getOrderForm().done(function (orderForm) {
          var _email = '';
          switch (option) {
              case 1:
                  _email = $('#client-email').val();
                  break;
              case 2:
                  _email = orderForm.clientProfileData.email
                  break;
              case 3:
                  _email = $('#client-email').val();
                  break;
          }
          $.ajax({
              headers: _headers,
              type: 'GET',
              url: '/api/dataentities/CL/search?_where=email=' + _email + '&_fields=id,birthDate',
              success: function (user) {
                  if (user.length > 0) {
                      //EMAIL CADASTRADO
                      var _user_id = user[0].id;
                      var _date = (user[0].birthDate !== null && user[0].birthDate !== undefined ? user[0].birthDate.split('T')[0] : '');
                      $('#client-birthDate').val(_date);
                      console.log('Email está cadastrado')
                      const userAge = funcsBirthDate.getAge(_date);
                    
                      
                      if (_date === '' || userAge < 18) {
                          //NÃO POSSUI DATA DE NASCIMENTO OU É MENOR DE 18
                          //FORÇA USUÁRIO PREENCHER DATA DE NASCIMENTO OU SAIR
                          if (option === 1) {
                              window.location.hash !== '#/profile' ? $('.link-box-edit.btn.btn-small').click() : null;

                              const interval = setInterval(() => {
                                  let userData = vtexjs.checkout.orderForm.clientProfileData;
                                  if (userData.document !== null &&
                                      userData.document.split('*').length == 1 ||
                                      userData.firstName.split('*').length == 1 ||
                                      userData.phone.split('*').length == 1) {

                                      if (window.location.hash !== '#/profile') {
                                          window.location.hash = '#/profile';
                                          clearInterval(interval);
                                      }
                                  }
                              }, 1000)

                          } else if (option === 2) {
                              window.location.hash !== '#/profile' ? window.location.hash = '#/profile' : null;
                          }
                      }
                      funcsBirthDate.actionToSaveOrCreate();
                  } else {
                      //EMAIL NÃO CADASTRADO
                      window.location.hash !== '#/profile' ? window.location.hash = '#/profile' : null;

                      funcsBirthDate.actionToSaveOrCreate();
                  }
                  $('body').on('click', '.close.vtexIdUI-close', () => {
                      funcsBirthDate.init();
                  })

              }
          });
      });
  },
  actionToSaveOrCreate: function () {
      const isOfAge = age => age >= 18;
      const createError = (error) => {
        $('.client-birth .help.error').remove()
        $('#client-birthDate').after(`<span class="help error" style="width: 100%">${error}</span>`);
        $('#client-birthDate').focus();
        $('#client-birthDate').addClass('error');
      }

      $('body').on('keyup', '#client-birthDate', function (event) {
          $('#client-birthDate').removeClass('error');
          $('.client-birthDate span.error').remove();
      })

      $('body').on('blur', '#client-birthDate', function (event) {
          const userBirthday = $(this).val();
          const userAge = funcsBirthDate.getAge(userBirthday);

          if ($('#client-birthDate').val().length < 10) {
              //DATA DE NASCIMENTO NÃO PREENCHIDA

              createError('Campo obrigatório.')
          } else if (!isOfAge(userAge)) {
              createError('Você deve ter mais de 18 anos!')
          } else {
              $('.client-birth .help.error').remove()
          }

          var _element = $(this);
          var _date = _element.val().replace(/\//g, '-');
          var _user_id = _element.attr('data-id');
          if (_user_id !== "undefined") {
              funcsBirthDate.saveData(_date, _user_id);
          } else {
              funcsBirthDate.createData(_date);
          }


      });

      $('#go-to-shipping').click(function (e) {
          const userBirthday = $('#client-birthDate').val();
          const userAge = funcsBirthDate.getAge(userBirthday);

          if (userBirthday.length < 10) {
              e.preventDefault();
              
              createError('Campo obrigatório.')
          } else if (!isOfAge(userAge)) {
            e.preventDefault();

            createError('Você deve ter mais de 18 anos!')
          }
      })
  },
  createData: function (_date) {
      if (_date != "" && _date != undefined && _date != null) {
          var _email = $('#client-email').val();
          var _json = {
              "email": _email,
              "birthDate": _date
          };
          $.ajax({
              headers: _headers,
              data: JSON.stringify(_json),
              type: 'PATCH',
              url: '/api/dataentities/CL/documents/',
              success: function (user) {
                  //CRIOU USUÁRIO JUNTO COM DATA DE NASCIMENTO
              }
          });
      }
  },
  saveData: function (_date, _user_id) {
      if (_date != "" && _date != undefined && _date != null) {
          var _json = {
              "birthDate": _date
          };
          $.ajax({
              headers: _headers,
              data: JSON.stringify(_json),
              type: 'PATCH',
              url: '/api/dataentities/CL/documents/' + _user_id,
              success: function (user) {
                  //DATA DE NASCIMENTO CADASTRADA COM SUCESSO
              }
          });
      }
  },

  getAge: birth => {
    let today = new Date();
    ageMS = Date.parse(Date()) - Date.parse(birth);
    today.setTime(ageMS);
    age = today.getFullYear() - 1970;
  
    return age || 0;
  },

  addFieldBirthDate: (_date, _user_id) => {
      const fieldToAppendAfter = $($('.client-email')[1])
      if (!$('p.client-birth').length) {
          var ua = navigator.userAgent.toLowerCase();
          if (ua.indexOf('safari') != -1) {
              if (ua.indexOf('chrome') > -1) {
                  fieldToAppendAfter.after('<p class="client-birth input pull-left text mask" style="margin-left: 18px; width: 48%;">    <label for="client-birthDate">Data de nascimento</label>    <input type="date" id="client-birthDate" class="input-small" value="' + _date + '" data-id="' + _user_id + '"> </p>');
              } else {
                  fieldToAppendAfter.after('<p class="client-birth input pull-left text mask" style="margin-left: 18px; width: 48%;">    <label for="client-birthDate">Data de nascimento</label>    <input type="text" id="client-birthDate" class="input-small" value="' + _date + '" data-id="' + _user_id + '" placeholder="DD/MM/AAAA"> </p>');
                  try {
                      $('#client-birthDate').mask('99/99/9999');

                  } catch (error) {
                      console.log(error);
                  }
              }

              fieldToAppendAfter.addClass('pull-left').css({ width: '48%' });
          }

      };
  }
}

$(window).on('hashchange', () => {
  setTimeout(function () {
    window.location.hash !== '#/cart' &&
    window.location.hash !== '#/email' &&
    window.location.hash !== ''
      ? funcsBirthDate.init()
      : null;
  }, 1200);
});

$(document).ready(function () {
  setTimeout(function () {
    window.location.hash !== '#/cart' &&
    window.location.hash !== '#/email' &&
    window.location.hash !== ''
      ? funcsBirthDate.init()
      : null;
  }, 1200);

  saveTimeStampFromBuying();
});
