/*
  ----
  YOU WILL NEED JQUERY MASK PLUGIN!!
  > to remove the mask, go to line 221
  ----
*/

// set minimum age
const MINIMUM_AGE = 18;
const _headers = {
  Accept: 'application/vnd.vtex.ds.v10+json',
  'Content-Type': 'application/json',
};

const funcsBirthDate = {
  init: () => {
      const userData = vtexjs.checkout.orderForm.clientProfileData;
      // EXISTE DUAS POSSIBILIDADES DE USUÃRIOS LOGADOS
      // 1Â° TEM DADOS SALVOS MAS NÃƒO ESTÃ CONECTADO
      // 2Â° TEM DADOS SALVOS E ESTÃ CONECTADO
      // 3Â° NÃƒO TEM DADOS SALVOS

      // VERIFICAÃ‡ÃƒO SE EXISTE DADOS DO USUÃRIO
      if (userData !== null) {
          if (userData.document !== null && userData.document.split('*').length > 1 ||
              userData.firstName !== null && userData.firstName.split('*').length > 1 ||
              userData.phone !== null && userData.phone.split('*').length > 1) {
              // 1Â°
              funcsBirthDate.checKIfHaveBirthDate(1);
          } else {
              // 2Â°
              funcsBirthDate.checKIfHaveBirthDate(2);
          }
      } else {
          // 3Â°
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
                      var [year, month, day] = (user[0].birthDate !== null && user[0].birthDate !== undefined ? user[0].birthDate.split('T')[0] : '').split('-');
                      const _date = `${day}/${month}/${year}`
                      
                      $('#client-birthDate').val(_date);

                      console.log('Email estÃ¡ cadastrado')
                      const userAge = funcsBirthDate.getAge(_date);
                    
                      if (_date === '' || userAge < MINIMUM_AGE) {
                          //NÃƒO POSSUI DATA DE NASCIMENTO OU Ã‰ MENOR DE 18
                          //FORÃ‡A USUÃRIO PREENCHER DATA DE NASCIMENTO OU SAIR
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
                      //EMAIL NÃƒO CADASTRADO
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
        // $('#client-birthDate').focus();
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
              //DATA DE NASCIMENTO NÃƒO PREENCHIDA

              createError('Campo obrigatÃ³rio.')
          } else if (!isOfAge(userAge)) {
              createError('VocÃª deve ter mais de 18 anos!')
          } else {
              $('.client-birth .help.error').remove()
          }

          const _element = $(this);
          const [day, month, year] = _element.val().split('/');
          const _date = `${year}-${month}-${day}`;
          const _user_id = _element.attr('data-id');

          if (_user_id !== "undefined") {
              funcsBirthDate.saveData(_date, _user_id);
          } else {
              funcsBirthDate.createData(_date);
          }
      });

      $('#go-to-shipping').on('click', function (e) {
          const userBirthday = $('#client-birthDate').val();
          const userAge = funcsBirthDate.getAge(userBirthday);

          if (userBirthday.length < 10) {
              e.preventDefault();
              
              createError('Campo obrigatÃ³rio.')
          } else if (!isOfAge(userAge)) {
            e.preventDefault();

            createError('VocÃª deve ter mais de 18 anos!')
          }
      })
  },
  createData: function (_date) {
      if (_date != "" && _date != undefined && _date != null) {
          const _email = $('#client-email').val();
          const _json = {
              "email": _email,
              "birthDate": _date
          };

          $.ajax({
              headers: _headers,
              data: JSON.stringify(_json),
              type: 'PATCH',
              url: '/api/dataentities/CL/documents/',
              success: function (user) {
                  //CRIOU USUÃRIO JUNTO COM DATA DE NASCIMENTO
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

  getAge: (birth) => {
    const [day, month, year] = birth.split("/");
    const birthday = new Date(parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10));

    const diff = Date.now() - birthday.getTime();
    const age = new Date(diff);

    return Math.abs(age.getUTCFullYear() - 1970) || 0;
},

  addFieldBirthDate: (_date, _user_id) => {
      const fieldToAppendAfter = $($('.client-email')[1])
      if (!$('p.client-birth').length) {
          var ua = navigator.userAgent.toLowerCase();
          if (ua.indexOf('safari') != -1) {
            fieldToAppendAfter.after(`
                <p class="client-birth input text mask">
                    <label for="client-birthDate">Data de nascimento</label>
                    <input type="text" id="client-birthDate" class="input-small" value="${_date}" data-id="${_user_id}" placeholder="dd/mm/aaaa" />
                </p>`);

              // Jquery mask plugin
              $('#client-birthDate').mask('00/00/0000');
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
});
