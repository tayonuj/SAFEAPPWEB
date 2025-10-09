<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>SAFE APP</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.0/font/bootstrap-icons.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />


        <link href="{{asset('/css/app.css') }}" rel="stylesheet">
        <!-- ===============================================-->
        <!--    Favicons-->
        <!-- ===============================================-->
{{--        <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/favicons/apple-touch-icon.png">--}}
{{--        <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicons/favicon-32x32.png">--}}
{{--        <link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicons/favicon-16x16.png">--}}
{{--        <link rel="shortcut icon" type="image/x-icon" href="/assets/img/favicons/favicon.ico">--}}
{{--        <link rel="manifest" href="/assets/img/favicons/manifest.json">--}}
{{--        <meta name="msapplication-TileImage" content="/assets/img/favicons/mstile-150x150.png">--}}
{{--        <meta name="theme-color" content="#ffffff">--}}
{{--        <script src="/assets/js/config.js"></script>--}}
{{--        <script src="/vendors/simplebar/simplebar.min.js"></script>--}}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap">
        <style>
            .custom-font {
                font-family: 'Poppins', sans-serif;
            }
        </style>

        <!-- ===============================================-->
        <!--    Stylesheets-->
        <!-- ===============================================-->
        <link rel="preconnect" href="https://fonts.gstatic.com">
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,600,700%7cPoppins:300,400,500,600,700,800,900&amp;display=swap" rel="stylesheet">
        <link href="/vendors/simplebar/simplebar.min.css" rel="stylesheet">
        <link href="/assets/css/theme-rtl.min.css" rel="stylesheet" id="style-rtl">
        <link href="/assets/css/theme.min.css" rel="stylesheet" id="style-default">
        <link href="/assets/css/user-rtl.min.css" rel="stylesheet" id="user-style-rtl">
        <link href="/assets/css/user.min.css" rel="stylesheet" id="user-style-default">
{{--        <script>--}}
{{--            var isRTL = JSON.parse(localStorage.getItem('isRTL'));--}}
{{--            if (isRTL) {--}}
{{--                var linkDefault = document.getElementById('style-default');--}}
{{--                var userLinkDefault = document.getElementById('user-style-default');--}}
{{--                linkDefault.setAttribute('disabled', true);--}}
{{--                userLinkDefault.setAttribute('disabled', true);--}}
{{--                document.querySelector('html').setAttribute('dir', 'rtl');--}}
{{--            } else {--}}
{{--                var linkRTL = document.getElementById('style-rtl');--}}
{{--                var userLinkRTL = document.getElementById('user-style-rtl');--}}
{{--                linkRTL.setAttribute('disabled', true);--}}
{{--                userLinkRTL.setAttribute('disabled', true);--}}
{{--            }--}}
{{--        </script>--}}
    </head>
    <body>
        @yield('content')
        <script src="{{asset('/js/app.js')}}"></script>
        <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
        <script>
            feather.replace()
        </script>

        <!-- ===============================================-->
        <!--    JavaScripts-->
        <!-- ===============================================-->
{{--        <script src="/vendors/popper/popper.min.js"></script>--}}
{{--        <script src="/vendors/bootstrap/bootstrap.min.js"></script>--}}
{{--        <script src="/vendors/anchorjs/anchor.min.js"></script>--}}
{{--        <script src="/vendors/is/is.min.js"></script>--}}
{{--        <script src="/vendors/fontawesome/all.min.js"></script>--}}
{{--        <script src="/vendors/lodash/lodash.min.js"></script>--}}
{{--        <script src="https://polyfill.io/v3/polyfill.min.js?features=window.scroll"></script>--}}
{{--        <script src="/vendors/list.js/list.min.js"></script>--}}
{{--        <script src="/assets/js/theme.js"></script>--}}


        <!--Start of Tawk.to Script-->
        <script type="text/javascript">

            // const timeoutInMS = 60000*60000; // 1 minutes -> 1 * 60 * 1000
            // let timeoutId;
            // setupTimers();
            // function handleInactive() {
            //     let user = JSON.parse(localStorage.getItem('user'));
            //     if(user){
            //         alert('Your session is timeout..please try sign in again.')
            //     }
            //     localStorage.removeItem('user');
            //     localStorage.removeItem('Token');
            //     localStorage.removeItem('menu');
            //     localStorage.removeItem('admin_emp_array');
            //     window.location.reload();
            //     // document.getElementById('logout-form').submit();
            //     // Here you want to logout a user and/or ping your token
            // }
            //
            // function startTimer() {
            //     // setTimeout returns an ID (can be used to start or clear a timer)
            //     timeoutId = setTimeout(handleInactive, timeoutInMS);
            // }
            //
            // function resetTimer() {
            //     clearTimeout(timeoutId);
            //     startTimer();
            // }
            //
            // function setupTimers () {
            //     document.addEventListener("keypress", resetTimer, false);
            //     document.addEventListener("mousemove", resetTimer, false);
            //     document.addEventListener("mousedown", resetTimer, false);
            //     document.addEventListener("touchmove", resetTimer, false);
            //
            //     startTimer();
            // }
            //
            // document.addEventListener('DOMContentLoaded', () => {
            //     // Set a sessionStorage flag when the page is loaded
            //     sessionStorage.setItem('pageActive', 'true');
            //
            //     // Handle beforeunload event
            //     window.addEventListener('beforeunload', (event) => {
            //         // If the sessionStorage flag is present, it's a refresh
            //         if (sessionStorage.getItem('pageActive')) {
            //             sessionStorage.removeItem('pageActive');
            //         } else {
            //             // Otherwise, clear localStorage on tab/browser close
            //             localStorage.clear();
            //         }
            //     });
            // });
        </script>

        <!--End of Tawk.to Script-->
    </body>
</html>
