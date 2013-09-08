var fs = require('fs');
var csv = require('csv');

var saleData = {};

console.log("Write Sale Report", new Date() );

fs.readFile(__dirname + '/filter.dat', 'utf8', function(error, data){
	parseSaleCSV(data);
});


var parseSaleCSV = function(data){
	// csv().from.path(__dirname+ '/input' + '/salesreport_' + "201308" + '.csv', { delimiter : ',', escape : '"' })
	csv().from.path(__dirname+ '/input' + '/salesreport_' + getYearMM() + '.csv', { delimiter : ',', escape : '"' })
	.transform( function(row) {
		row.unshift(row.pop() );
		return row;
	})
	.on('record', function(row, index){

		if( index != 0 ){

			var info = info || {};
			info.appID = row[7];
			info.product_type = row[8];
			info.inAppID = row[9];
			info.date = row[2];
			info.price = Number( row[11].replace(',', '') );
			info.currency = row[10];
			info.cnt = row[4] === 'Charged' ? 1 : -1;
			// info.price = row[4] === 'Charged' ? info.price : -info.price;

			if( typeof saleData[ row[2] ] === 'undefined' ){
				saleData[ info.date ] = JSON.parse(data);
			}

			if( info.product_type === 'paidapp' && typeof saleData[ info.date ] !== 'undefined' && typeof saleData[ info.date ][ info.appID ] !== 'undefined'){

				saleData[ info.date ][ info.appID ] = saleData[ info.date ][ info.appID ] || {};
				saleData[ info.date ][ info.appID ].currency = saleData[ info.date ][ info.appID ].currency || {};
				saleData[ info.date ][ info.appID ].currency[ info.currency ] = saleData[ info.date ][ info.appID ].currency[ info.currency ] || {};

				var inAppData = saleData[ info.date ][ info.appID ].currency[ info.currency ];

				inAppData.chargedRefundCount = inAppData.chargedRefundCount || 0;
				inAppData.chargedRefundCount += 1;

				inAppData.money = inAppData.money || 0;

				if( info.cnt > 0 ){
					inAppData.chargedCount = inAppData.chargedCount || 0;
					inAppData.chargedCount += 1;
					inAppData.money += info.price;
				} else {
					inAppData.refundCount = inAppData.refundCount || 0;
					inAppData.refundCount += 1;
					inAppData.money -= info.price;
				}
			}

			else if( info.product_type === 'inapp' && info.appID === 'com.uangel.tomokidsgoogle' && typeof saleData[ info.date ][ info.appID ] !== 'undefined' ){
				saleData[ info.date ][ info.appID ].inApp = saleData[ info.date ][ info.appID ].inApp || {};
				saleData[ info.date ][ info.appID ].inApp[ info.currency ] = saleData[ info.date ][ info.appID ].inApp[ info.currency ] || {};
				saleData[ info.date ][ info.appID ].inApp[ info.currency ][ info.price ] = saleData[ info.date ][ info.appID ].inApp[ info.currency ][ info.price ] || {};

				var inAppData = saleData[ info.date ][ info.appID ].inApp[ info.currency ][ info.price ];

				inAppData.chargedRefundCount = inAppData.chargedRefundCount || 0;
				inAppData.chargedRefundCount += 1;
				inAppData.money = inAppData.money || 0;

				if( info.cnt > 0 ){
					inAppData.chargedCount = inAppData.chargedCount || 0;
					inAppData.chargedCount += 1;
					inAppData.money += info.price;
				} else {
					inAppData.refundCount = inAppData.refundCount || 0;
					inAppData.refundCount += 1;
					inAppData.money -= info.price;
				}

			}

			else if( info.product_type === 'inapp' && typeof saleData[ info.date ][ info.appID ] !== 'undefined'){

				saleData[ info.date ][ info.appID ] = saleData[ info.date ][ info.appID ] || {};
				saleData[ info.date ][ info.appID ].inApp = saleData[ info.date ][ info.appID ].inApp || {};
				saleData[ info.date ][ info.appID ].inApp[ info.inAppID ] = saleData[ info.date ][ info.appID ].inApp[ info.inAppID ] || {};
				saleData[ info.date ][ info.appID ].inApp[ info.inAppID ][ info.currency ] = saleData[ info.date ][ info.appID ].inApp[ info.inAppID ][ info.currency ] || {};

				var inAppData = saleData[ info.date ][ info.appID ].inApp[ info.inAppID ][ info.currency ];
				inAppData.chargedRefundCount = inAppData.chargedRefundCount || 0;
				inAppData.chargedRefundCount += 1;

				inAppData.money = inAppData.money || 0;

				if( info.cnt > 0 ){
					inAppData.chargedCount = inAppData.chargedCount || 0;
					inAppData.chargedCount += 1;
					inAppData.money += info.price;
				} else {
					inAppData.refundCount = inAppData.refundCount || 0;
					inAppData.refundCount += 1;
					inAppData.money -= info.price;
				}

			}
		}
	} )
	.on('end', function(count) {
		for( var date in saleData ){
			var data = 'AppID,InAppID,Charged-Refund-Count,Charged,Refund,Currency,sum\n';
			// var data = 'AppID,InAppID,Charged-Refund-Count,Charged,Refund,Currency,sum,install-Count\n';
			for( var appID in saleData[ date ] ){

				// 앱을 구매하여 가격 정보를 가지고 있는 경우
				if( typeof saleData[ date ][ appID ].currency !== 'undefined' ){
					for( var keyCurrency in saleData[ date ][ appID ].currency ){
						data += appID + ',';
						data += ',';
						data += ( typeof saleData[ date ][ appID ].currency[ keyCurrency ].chargedRefundCount === 'undefined' || saleData[ date ][ appID ].currency[ keyCurrency ].chargedRefundCount === 0  ) ? ',' : saleData[ date ][ appID ].currency[ keyCurrency ].chargedRefundCount + ',';
						data += ( typeof saleData[ date ][ appID ].currency[ keyCurrency ].chargedCount === 'undefined' || saleData[ date ][ appID ].currency[ keyCurrency ].chargedCount === 0 ) ? ',' : saleData[ date ][ appID ].currency[ keyCurrency ].chargedCount + ',';
						data += ( typeof saleData[ date ][ appID ].currency[ keyCurrency ].refundCount === 'undefined' || saleData[ date ][ appID ].currency[ keyCurrency ].refundCount === 0 ) ? ',' : saleData[ date ][ appID ].currency[ keyCurrency ].refundCount + ',';
						data += keyCurrency + ',';
						data += saleData[ date ][ appID ].currency[ keyCurrency ].money;
						data += '\n';
					}
				}
				// 토모키즈 앱인 경우
				else if( typeof saleData[ date ][ appID ].inApp !== 'undefined' && appID === 'com.uangel.tomokidsgoogle') {
					for( var keyCurrency in saleData[ date ][ appID ].inApp ){
						for( var price in saleData[ date ][ appID ].inApp[keyCurrency] ){
							data += appID + ',';
							data += price + ',';

							data += ( typeof saleData[ date ][ appID ].inApp[ keyCurrency ][ price ].chargedRefundCount === 'undefined' || saleData[ date ][ appID ].inApp[ keyCurrency ][ price ].chargedRefundCount === 0  ) ? ',' : saleData[ date ][ appID ].inApp[ keyCurrency ][ price ].chargedRefundCount + ',';
							data += ( typeof saleData[ date ][ appID ].inApp[ keyCurrency ][ price ].chargedCount === 'undefined' || saleData[ date ][ appID ].inApp[ keyCurrency ][ price ].chargedCount === 0 ) ? ',' : saleData[ date ][ appID ].inApp[ keyCurrency ][ price ].chargedCount + ',';
							data += ( typeof saleData[ date ][ appID ].inApp[ keyCurrency ][ price ].refundCount === 'undefined' || saleData[ date ][ appID ].inApp[ keyCurrency ][ price ].refundCount === 0 ) ? ',' : saleData[ date ][ appID ].inApp[ keyCurrency ][ price ].refundCount + ',';

							data += keyCurrency + ',';
							data += saleData[ date ][ appID ].inApp[ keyCurrency ][ price ].money;
							data += '\n';
						}
					}
				}
				// 인앱을 구매하여 가격정보를 가지고 있는 경우
				else if( typeof saleData[ date ][ appID ].inApp !== 'undefined' ){
					for( var inAppID in saleData[ date ][ appID ].inApp ){
						for( var currency in saleData[ date ][ appID ].inApp[ inAppID ] ){
							data += appID + ',';
							data += inAppID + ',';

							data += ( typeof saleData[ date ][ appID ].inApp[ inAppID ][ currency ].chargedRefundCount === 'undefined' || saleData[ date ][ appID ].inApp[ inAppID ][ currency ].chargedRefundCount === 0  ) ? ',' : saleData[ date ][ appID ].inApp[ inAppID ][ currency ].chargedRefundCount + ',';
							data += ( typeof saleData[ date ][ appID ].inApp[ inAppID ][ currency ].chargedCount === 'undefined' || saleData[ date ][ appID ].inApp[ inAppID ][ currency ].chargedCount === 0 ) ? ',' : saleData[ date ][ appID ].inApp[ inAppID ][ currency ].chargedCount + ',';
							data += ( typeof saleData[ date ][ appID ].inApp[ inAppID ][ currency ].refundCount === 'undefined' || saleData[ date ][ appID ].inApp[ inAppID ][ currency ].refundCount === 0 ) ? ',' : saleData[ date ][ appID ].inApp[ inAppID ][ currency ].refundCount + ',';

							data += currency + ',';
							data += saleData[ date ][ appID ].inApp[ inAppID ][ currency ].money;
							data += '\n';
						}
					}
				}
			}

			// console.log(data);

			var fileName = __dirname + "/output/" + date + '.csv';
			fs.writeFile( fileName, data, function(err){
				if( err ){
					throw err;
					console.log(err);
				}
				else console.log("CSV File Create ");
			} );

		}
	})
	.on('error', function(error){
		console.log(error.message);
	});
};

var getYearMM = function(){
	// var now = new Date();
	// var yearMM = now.getFullYear() + '';
	// var month = now.getMonth() + 1;
	// month = ( month < 10 ? '0' : '' ) + month;
	// yearMM = yearMM + month;
	// return yearMM;
	var tmpDate = new Date();
	var yesterDay = new Date(new Date( tmpDate.getFullYear() + '-' + (tmpDate.getMonth() + 1 ) + '-' + ( tmpDate.getDate() ) + ' 00:00:00') - 1 - 1000*60*60*24);
	yesterDayStr = yesterDay.getFullYear();
	yesterDayStr += '' + ( ( yesterDay.getMonth() + 1 < 10 ) ? '0' : '' ) + (yesterDay.getMonth() + 1);
	yesterDayStr += '' + yesterDay.getDate();
	return yesterDayStr;
};


