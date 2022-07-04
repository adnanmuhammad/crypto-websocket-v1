// Make connection
var socket = io.connect('http://3.236.53.56:1337');

update_gain_table_data_v2();
function update_gain_table_data_v2() {
    // get username
    var name = $("#user_name").val();
    // send it to server
    socket.emit("update_gain_table_data_v2", name);
}

socket.on('fetch_gain_table_data_v2', function(data){
    var html = "";
    $('#tbl-gain-table > tbody').html('');
    //console.log(data + '__________');

    data = JSON.parse(data);
    for(var i = 0; i < data.length; i++) {
        var sr_no = eval(i + 1);
        var obj = data[i];

        var currency = obj.symbol;
        currency = currency.replace('USDT', '');

        var perc_inc = obj.percent_increase;
        perc_inc = perc_inc ? Number(perc_inc).toFixed(2) : '';

        var curr_sym_complete = obj.symbol;
        url_str = curr_sym_complete.replace('USDT', '_USDT');
        var currency_link = 'https://www.binance.com/en/trade/'+url_str+'?theme=dark&type=spot';


        var one_min_gain = obj.one_min_gain;
        one_min_gain = one_min_gain ? Number(one_min_gain).toFixed(2) : '';

        var two_min_gain = obj.two_min_gain;
        two_min_gain = two_min_gain ? Number(two_min_gain).toFixed(2) : '';

        var three_min_gain = obj.three_min_gain;
        three_min_gain = three_min_gain ? Number(three_min_gain).toFixed(2) : '';

        var four_min_gain = obj.four_min_gain;
        four_min_gain = four_min_gain ? Number(four_min_gain).toFixed(2) : '';

        var five_min_gain = obj.five_min_gain;
        five_min_gain = five_min_gain ? Number(five_min_gain).toFixed(2) : '';

        var six_min_gain = obj.six_min_gain;
        six_min_gain = six_min_gain ? Number(six_min_gain).toFixed(2) : '';


        var seven_min_gain = obj.seven_min_gain;
        seven_min_gain = seven_min_gain ? Number(seven_min_gain).toFixed(2) : '';

        var eight_min_gain = obj.eight_min_gain;
        eight_min_gain = eight_min_gain ? Number(eight_min_gain).toFixed(2) : '';

        var nine_min_gain = obj.nine_min_gain;
        nine_min_gain = nine_min_gain ? Number(nine_min_gain).toFixed(2) : '';

        var ten_min_gain = obj.ten_min_gain;
        ten_min_gain = ten_min_gain ? Number(ten_min_gain).toFixed(2) : '';

        var eleven_min_gain = obj.eleven_min_gain;
        eleven_min_gain = eleven_min_gain ? Number(eleven_min_gain).toFixed(2) : '';

        var twelve_min_gain = obj.twelve_min_gain;
        twelve_min_gain = twelve_min_gain ? Number(twelve_min_gain).toFixed(2) : '';

        var thirteen_min_gain = obj.thirteen_min_gain;
        thirteen_min_gain = thirteen_min_gain ? Number(thirteen_min_gain).toFixed(2) : '';

        var foutreen_min_gain = obj.foutreen_min_gain;
        foutreen_min_gain = foutreen_min_gain ? Number(foutreen_min_gain).toFixed(2) : '';

        var fifteen_min_gain = obj.fifteen_min_gain;
        fifteen_min_gain = fifteen_min_gain ? Number(fifteen_min_gain).toFixed(2) : '';

        var sixteen_min_gain = obj.sixteen_min_gain;
        sixteen_min_gain = sixteen_min_gain ? Number(sixteen_min_gain).toFixed(2) : '';

        var seventeen_min_gain = obj.seventeen_min_gain;
        seventeen_min_gain = seventeen_min_gain ? Number(seventeen_min_gain).toFixed(2) : '';

        var eighteen_min_gain = obj.eighteen_min_gain;
        eighteen_min_gain = eighteen_min_gain ? Number(eighteen_min_gain).toFixed(2) : '';

        var nineteen_min_gain = obj.nineteen_min_gain;
        nineteen_min_gain = nineteen_min_gain ? Number(nineteen_min_gain).toFixed(2) : '';

        var twenty_min_gain = obj.twenty_min_gain;
        twenty_min_gain = twenty_min_gain ? Number(twenty_min_gain).toFixed(2) : '';

        html += '<tr>';
        html += '<td style="width: 5%; text-align: center;"> '+ sr_no +'</td>';
        html += '<td style="width: 5%;"> <a target="_blank" href='+ currency_link +'>'+ currency +' </a></td>';
        html += '<td style="width: 10%; text-align: center;"> '+ perc_inc +'</td>';

        if(one_min_gain >= 0) { html += '<td class="cls_td"> '+ one_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ one_min_gain +'</td>'; }
        if(two_min_gain >= 0) { html += '<td class="cls_td"> '+ two_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ two_min_gain +'</td>'; }
        if(three_min_gain >= 0) { html += '<td class="cls_td"> '+ three_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ three_min_gain +'</td>'; }
        if(four_min_gain >= 0) { html += '<td class="cls_td"> '+ four_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ four_min_gain +'</td>'; }
        if(five_min_gain >= 0) { html += '<td class="cls_td"> '+ five_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ five_min_gain +'</td>'; }
        if(six_min_gain >= 0) { html += '<td class="cls_td"> '+ six_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ six_min_gain +'</td>'; }
        if(seven_min_gain >= 0) { html += '<td class="cls_td"> '+ seven_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ seven_min_gain +'</td>'; }
        if(eight_min_gain >= 0) { html += '<td class="cls_td"> '+ eight_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ eight_min_gain +'</td>'; }
        if(nine_min_gain >= 0) { html += '<td class="cls_td"> '+ nine_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ nine_min_gain +'</td>'; }
        if(ten_min_gain >= 0) { html += '<td class="cls_td"> '+ ten_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ ten_min_gain +'</td>'; }
        if(eleven_min_gain >= 0) { html += '<td class="cls_td"> '+ eleven_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ eleven_min_gain +'</td>'; }
        if(twelve_min_gain >= 0) { html += '<td class="cls_td"> '+ twelve_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ twelve_min_gain +'</td>'; }
        if(thirteen_min_gain >= 0) { html += '<td class="cls_td"> '+ thirteen_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ thirteen_min_gain +'</td>'; }
        if(foutreen_min_gain >= 0) { html += '<td class="cls_td"> '+ foutreen_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ foutreen_min_gain +'</td>'; }
        if(fifteen_min_gain >= 0) { html += '<td class="cls_td"> '+ fifteen_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ fifteen_min_gain +'</td>'; }
        if(sixteen_min_gain >= 0) { html += '<td class="cls_td"> '+ sixteen_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ sixteen_min_gain +'</td>'; }
        if(seventeen_min_gain >= 0) { html += '<td class="cls_td"> '+ seventeen_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ seventeen_min_gain +'</td>'; }
        if(eighteen_min_gain >= 0) { html += '<td class="cls_td"> '+ eighteen_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ eighteen_min_gain +'</td>'; }
        if(nineteen_min_gain >= 0) { html += '<td class="cls_td"> '+ nineteen_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ nineteen_min_gain +'</td>'; }
        if(twenty_min_gain >= 0) { html += '<td class="cls_td"> '+ twenty_min_gain +'</td>'; } else { html += '<td class="cls_td_negative" style="color: #dd1144 !important;"> '+ twenty_min_gain +'</td>'; }

        html += '</tr>';


    }

    $('#tbl-gain-table > tbody').append(html);

});