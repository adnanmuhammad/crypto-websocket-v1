// Make connection
var socket = io.connect('http://3.236.53.56:1337');

update_gain_chart_data();
function update_gain_chart_data() {
    // get username
    var name = $("#user_name").val();
    // send it to server
    socket.emit("update_gain_chart_data", name);
}

socket.on('fetch_gain_chart_data', function(data){
    //console.log(data.first_name +' - ' + data.last_name +' - '+data.address);
    //$('#tbl-gain-chart > tbody').append('<tr><td scope="row">4</td><td> '+ data.first_name +' </td><td> '+ data.last_name +' </td><td> '+ data.address +' </td></tr>');

    $('#tbl-gain-chart > tbody').html('');
    var html = "";
    //console.log(data);

    for (var i = 0; i < data.length; i++) {
        if(data[i].time_interval == 1) {

            html += '<tr><td scope="row" style="font-size: 15px; font-weight: bold; text-align: center; background-color: #bddbff;">'+ data[i].time_interval +'</td>';
            for (var j = 1; j <= 20; j++) {
                var cell_data = eval('data[i].counter1_'+j);
                if(cell_data > 0) {
                    html += '<td class="cls_cell_counter_data" style="cursor: pointer;" data-time_interval="1" data-percent_value="'+j+'"> '+ cell_data +'</td>';
                } else {
                    html += '<td> &nbsp; </td>';
                }
            }
            html += '</tr>';

        } else if(data[i].time_interval == 3) {

            html += '<tr><td scope="row" style="font-size: 15px; font-weight: bold; text-align: center; background-color: #bddbff;">'+ data[i].time_interval +'</td>';
            for (var j = 1; j <= 20; j++) {
                var cell_data = eval('data[i].counter3_'+j);
                if(cell_data > 0) {
                    html += '<td class="cls_cell_counter_data" style="cursor: pointer;" data-time_interval="3" data-percent_value="'+j+'"> '+ cell_data +'</td>';
                } else {
                    html += '<td> &nbsp; </td>';
                }
            }
            html += '</tr>';

        } else if(data[i].time_interval == 5) {

            html += '<tr><td scope="row" style="font-size: 15px; font-weight: bold; text-align: center; background-color: #bddbff;">'+ data[i].time_interval +'</td>';
            for (var j = 1; j <= 20; j++) {
                var cell_data = eval('data[i].counter5_'+j);
                if(cell_data > 0) {
                    html += '<td class="cls_cell_counter_data" style="cursor: pointer;" data-time_interval="5" data-percent_value="'+j+'"> '+ cell_data +'</td>';
                } else {
                    html += '<td> &nbsp; </td>';
                }
            }
            html += '</tr>';

        } else if(data[i].time_interval == 7) {

            html += '<tr><td scope="row" style="font-size: 15px; font-weight: bold; text-align: center; background-color: #bddbff;">'+ data[i].time_interval +'</td>';
            for (var j = 1; j <= 20; j++) {
                var cell_data = eval('data[i].counter7_'+j);
                if(cell_data > 0) {
                    html += '<td class="cls_cell_counter_data" style="cursor: pointer;" data-time_interval="7" data-percent_value="'+j+'"> '+ cell_data +'</td>';
                } else {
                    html += '<td> &nbsp; </td>';
                }
            }
            html += '</tr>';

        } else if(data[i].time_interval == 10) {

            html += '<tr><td scope="row" style="font-size: 15px; font-weight: bold; text-align: center; background-color: #bddbff;">'+ data[i].time_interval +'</td>';
            for (var j = 1; j <= 20; j++) {
                var cell_data = eval('data[i].counter10_'+j);
                if(cell_data > 0) {
                    html += '<td class="cls_cell_counter_data" style="cursor: pointer;" data-time_interval="10" data-percent_value="'+j+'"> '+ cell_data +'</td>';
                } else {
                    html += '<td> &nbsp; </td>';
                }
            }
            html += '</tr>';

        } else if(data[i].time_interval == 60) {

            html += '<tr><td scope="row" style="font-size: 15px; font-weight: bold; text-align: center; background-color: #bddbff;">'+ data[i].time_interval +'</td>';
            for (var j = 1; j <= 20; j++) {
                var cell_data = eval('data[i].counter60_'+j);
                if(cell_data > 0) {
                    html += '<td class="cls_cell_counter_data" style="cursor: pointer;" data-time_interval="60" data-percent_value="'+j+'"> '+ cell_data +'</td>';
                } else {
                    html += '<td> &nbsp; </td>';
                }
            }
            html += '</tr>';
        } else if(data[i].time_interval == 15) {

            html += '<tr><td scope="row" style="font-size: 15px; font-weight: bold; text-align: center; background-color: #bddbff;">'+ data[i].time_interval +'</td>';
            for (var j = 1; j <= 20; j++) {
                var cell_data = eval('data[i].counter15_'+j);
                if(cell_data > 0) {
                    html += '<td class="cls_cell_counter_data" style="cursor: pointer;" data-time_interval="15" data-percent_value="'+j+'"> '+ cell_data +'</td>';
                } else {
                    html += '<td> &nbsp; </td>';
                }
            }
            html += '</tr>';
        } else if(data[i].time_interval == 30) {

            html += '<tr><td scope="row" style="font-size: 15px; font-weight: bold; text-align: center; background-color: #bddbff;">'+ data[i].time_interval +'</td>';
            for (var j = 1; j <= 20; j++) {
                var cell_data = eval('data[i].counter30_'+j);
                if(cell_data > 0) {
                    html += '<td class="cls_cell_counter_data" style="cursor: pointer;" data-time_interval="30" data-percent_value="'+j+'"> '+ cell_data +'</td>';
                } else {
                    html += '<td> &nbsp; </td>';
                }
            }
            html += '</tr>';
        } else if(data[i].time_interval == 45) {

            html += '<tr><td scope="row" style="font-size: 15px; font-weight: bold; text-align: center; background-color: #bddbff;">'+ data[i].time_interval +'</td>';
            for (var j = 1; j <= 20; j++) {
                var cell_data = eval('data[i].counter45_'+j);
                if(cell_data > 0) {
                    html += '<td class="cls_cell_counter_data" style="cursor: pointer;" data-time_interval="45" data-percent_value="'+j+'"> '+ cell_data +'</td>';
                } else {
                    html += '<td> &nbsp; </td>';
                }
            }
            html += '</tr>';
        }
    }

    $('#tbl-gain-chart > tbody').append(html);

});

$('body').on('click', '.cls_cell_counter_data', function() {
    var html = "";
    // $('#div-gain-chart-stats1').show();
    // $('#div-gain-chart-stats2').show();

    var html = "";
    var html_tbl3 = "";

    $('#tbl-gain-chart-stats1 > tbody').html('');
    $('#tbl-gain-chart-stats2 > tbody').html('');

    var time_interval = $(this).data("time_interval");
    var percent_value = $(this).data("percent_value");
    $('#span_market_gain').html('MARKET GAIN '+time_interval+' MINUTE '+ percent_value +' %');

    //console.log('Time Interval:'+time_interval+', percent_value:'+percent_value);

    $.ajax({
        url: "http://3.236.53.56:1337/get_detail_charts_data",
        method: "POST",
        data: {time_interval: time_interval, percent_value: percent_value},
        success: function (response) {
            //console.log(response);

            $('#tbl-gain-chart-stats1 > tbody').html('');
            $('#tbl-gain-chart-stats2 > tbody').html('');

            //console.log(data);
            data = JSON.parse(response);
            for(var i = 0; i < data.length; i++) {
                var sr_no = eval(i + 1);
                var obj = data[i];

                //console.log(obj.open+'____close______'+obj.close);

                var open = obj.open;
                open = Number(open).toFixed(6);

                var close = obj.close;
                close = Number(close).toFixed(6);

                var gain = (obj.close - obj.open);
                gain = Number(gain).toFixed(6);

                var currency = obj.symbol;
                currency = currency.replace('USDT', '');

                var perc_inc = obj.percent_increase;
                perc_inc = perc_inc ? Number(perc_inc).toFixed(2) : '';

                var curr_sym_complete = obj.symbol;
                url_str = curr_sym_complete.replace('USDT', '_USDT');
                var currency_link = 'https://www.binance.com/en/trade/'+url_str+'?theme=dark&type=spot';

                html += '<tr>';
                html += '<td> '+ sr_no +'</td>';
                html += '<td> USDT </td>';
                html += '<td> <a target="_blank" href='+ currency_link +'>'+ currency +' </a></td>';
                html += '<td> '+ close +'</td>';
                html += '<td> '+ open +'</td>';
                html += '<td> '+ close +'</td>';
                html += '<td> '+ gain +'</td>';
                html += '<td> '+ perc_inc +'</td>';
                html += '</tr>';

                var one_hr_gain = obj.one_hr_gain;
                one_hr_gain = one_hr_gain ? Number(one_hr_gain).toFixed(2) : '';

                var thirty_min_gain = obj.thirty_min_gain;
                thirty_min_gain = thirty_min_gain ? Number(thirty_min_gain).toFixed(2) : '';

                var ten_min_gain = obj.ten_min_gain;
                ten_min_gain = ten_min_gain ? Number(ten_min_gain).toFixed(2) : '';

                var five_min_gain = obj.five_min_gain;
                five_min_gain = five_min_gain ? Number(five_min_gain).toFixed(2) : '';

                var two_min_gain = obj.two_min_gain;
                two_min_gain = two_min_gain ? Number(two_min_gain).toFixed(2) : '';

                var one_min_gain = obj.one_min_gain;
                one_min_gain = one_min_gain ? Number(one_min_gain).toFixed(2) : '';

                html_tbl3 += '<tr>';
                html_tbl3 += '<td> '+ sr_no +'</td>';
                html_tbl3 += '<td> USDT </td>';
                html_tbl3 += '<td> <a target="_blank" href='+ currency_link +'>'+ currency +' </a></td>';
                html_tbl3 += '<td> '+ close +'</td>';
                html_tbl3 += '<td> '+ one_hr_gain +'</td>';
                html_tbl3 += '<td> '+ thirty_min_gain +'</td>';
                html_tbl3 += '<td> '+ ten_min_gain +'</td>';
                html_tbl3 += '<td> '+ five_min_gain +'</td>';
                html_tbl3 += '<td> '+ two_min_gain +'</td>';
                html_tbl3 += '<td> '+ one_min_gain +'</td>';

                html_tbl3 += '</tr>';

            }
            $('#tbl-gain-chart-stats1 > tbody').append(html);
            $('#tbl-gain-chart-stats2 > tbody').append(html_tbl3);
        }
    });



    //====== OLD Socket Call , Commented
    /*socket.emit("update_gain_chart_data2", [{
        time_interval: time_interval,
        percent_value: percent_value
    }]);*/
    //====== OLD Socket Call , Commented

});

socket.on('fetch_second_gain_chart_data', function(data){
        var html = "";
        var html_tbl3 = "";
        $('#tbl-gain-chart-stats1 > tbody').html('');
        $('#tbl-gain-chart-stats2 > tbody').html('');

        //console.log(data);
        data = JSON.parse(data);
        for(var i = 0; i < data.length; i++) {
            var sr_no = eval(i + 1);
            var obj = data[i];

            //console.log(obj.open+'____close______'+obj.close);

            var open = obj.open;
            open = Number(open).toFixed(6);

            var close = obj.close;
            close = Number(close).toFixed(6);

            var gain = (obj.close - obj.open);
            gain = Number(gain).toFixed(6);

            var currency = obj.symbol;
            currency = currency.replace('USDT', '');

            var perc_inc = obj.percent_increase;
            perc_inc = perc_inc ? Number(perc_inc).toFixed(2) : '';

            var curr_sym_complete = obj.symbol;
            url_str = curr_sym_complete.replace('USDT', '_USDT');
            var currency_link = 'https://www.binance.com/en/trade/'+url_str+'?theme=dark&type=spot';

            html += '<tr>';
            html += '<td> '+ sr_no +'</td>';
            html += '<td> USDT </td>';
            html += '<td> <a target="_blank" href='+ currency_link +'>'+ currency +' </a></td>';
            html += '<td> '+ close +'</td>';
            html += '<td> '+ open +'</td>';
            html += '<td> '+ close +'</td>';
            html += '<td> '+ gain +'</td>';
            html += '<td> '+ perc_inc +'</td>';
            html += '</tr>';

            var one_hr_gain = obj.one_hr_gain;
            one_hr_gain = one_hr_gain ? Number(one_hr_gain).toFixed(2) : '';

            var thirty_min_gain = obj.thirty_min_gain;
            thirty_min_gain = thirty_min_gain ? Number(thirty_min_gain).toFixed(2) : '';

            var ten_min_gain = obj.ten_min_gain;
            ten_min_gain = ten_min_gain ? Number(ten_min_gain).toFixed(2) : '';

            var five_min_gain = obj.five_min_gain;
            five_min_gain = five_min_gain ? Number(five_min_gain).toFixed(2) : '';

            var two_min_gain = obj.two_min_gain;
            two_min_gain = two_min_gain ? Number(two_min_gain).toFixed(2) : '';

            var one_min_gain = obj.one_min_gain;
            one_min_gain = one_min_gain ? Number(one_min_gain).toFixed(2) : '';

            html_tbl3 += '<tr>';
            html_tbl3 += '<td> '+ sr_no +'</td>';
            html_tbl3 += '<td> USDT </td>';
            html_tbl3 += '<td> <a target="_blank" href='+ currency_link +'>'+ currency +' </a></td>';
            html_tbl3 += '<td> '+ close +'</td>';
            html_tbl3 += '<td> '+ one_hr_gain +'</td>';
            html_tbl3 += '<td> '+ thirty_min_gain +'</td>';
            html_tbl3 += '<td> '+ ten_min_gain +'</td>';
            html_tbl3 += '<td> '+ five_min_gain +'</td>';
            html_tbl3 += '<td> '+ two_min_gain +'</td>';
            html_tbl3 += '<td> '+ one_min_gain +'</td>';

            html_tbl3 += '</tr>';

        }
        $('#tbl-gain-chart-stats1 > tbody').append(html);
        $('#tbl-gain-chart-stats2 > tbody').append(html_tbl3);

    });