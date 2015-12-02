using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Windows.Web.Http;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.TypeConversion;

namespace Stockswagen
{
    // ReSharper disable once ClassNeverInstantiated.Global
    public class NotAvailableTypeConverter<T> : DefaultTypeConverter
    {
        public override object ConvertFromString(TypeConverterOptions options, string text)
        {
            if (text == "N/A")
                return null;

            var underlyingType = Nullable.GetUnderlyingType(typeof (T));

            return TypeConverterFactory.GetConverter(underlyingType ?? typeof(T)).ConvertFromString(options, text);
        }
    }

    public class YahooFinance : IFinance
    {
        public async Task<IEnumerable<Quote>> GetQuotes(List<string> ticks)
        {
            if (ticks.Count == 0)
                return new List<Quote>();

            var tickNames = string.Join(",", ticks);
            var uri = new Uri($"http://download.finance.yahoo.com/d/quotes?f=sl1d1t1v&s={tickNames}");
            var httpClient = new HttpClient();

            try
            {
                var result = await httpClient.GetStringAsync(uri);
                var csv = new CsvReader(new StringReader(result));
                csv.Configuration.RegisterClassMap<QuoteMap>();
                csv.Configuration.HasHeaderRecord = false;
                return csv.GetRecords<Quote>().ToList();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                throw;
            }
            finally
            {
                httpClient.Dispose();
            }
        }

        public async Task<QuoteEvolution> GetQuoteEvolution(string tick, DateTime initialDate, DateTime finalDate, Periodicity periodicity)
        {
            var a = initialDate.Month - 1;
            var b = initialDate.Day;
            var c = initialDate.Year;
            var d = finalDate.Month - 1;
            var e = finalDate.Day;
            var f = finalDate.Year;
            var g = GetPeriodicityValue(periodicity);

            var uri = new Uri($"http://ichart.finance.yahoo.com/table.txt?a={a}&b={b}&c={c}&d={d}&e={e}&f={f}&g={g}&s={tick}");
            var httpClient = new HttpClient();

            try
            {
                var result = await httpClient.GetStringAsync(uri);
                var csv = new CsvReader(new StringReader(result));
                csv.Configuration.IgnoreHeaderWhiteSpace = true;
                var quotes = csv.GetRecords<QuoteEvolution.Quote>().ToList();
                return new QuoteEvolution {Tick = tick, Quotes = quotes};
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                throw;
            }
            finally
            {
                httpClient.Dispose();
            }
        }

        private static char GetPeriodicityValue(Periodicity periodicity)
        {
            switch (periodicity)
            {
                case Periodicity.Daily:
                    return 'd';
                case Periodicity.Weekly:
                    return 'w';
                case Periodicity.Monthly:
                    return 'm';
                default:
                    throw new ArgumentOutOfRangeException(nameof(periodicity), periodicity, null);
            }
        }
    }

    // ReSharper disable once ClassNeverInstantiated.Global
    public sealed class QuoteMap : CsvClassMap<Quote>
    {
        public QuoteMap()
        {
            Map(m => m.Tick).Index(0);
            Map(m => m.CurrentQuote).Index(1); // .TypeConverter<NotAvailableTypeConverter<double?>>();
            Map(m => m.DateTime).ConvertUsing(row =>
            {
                var date = row.GetField<string, NotAvailableTypeConverter<string>>(2);
                var time = row.GetField<string, NotAvailableTypeConverter<string>>(3);
                if (date == null)
                    return null;

                string format;
                string dateTime;
                if (time == null)
                {
                    format = "MM/dd/yyyy";
                    dateTime = date;
                }
                else
                {
                    format = "MM/dd/yyyyTh:mtt";
                    dateTime = date + 'T' + time.ToUpper();
                }

                return (DateTime?) DateTime.ParseExact(dateTime, format, new CultureInfo("en-US"));
            });
            Map(m => m.Volume).Index(4); // .TypeConverter<NotAvailableTypeConverter<long?>>();
        }
    }
}
