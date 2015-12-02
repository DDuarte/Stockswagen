using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Stockswagen
{
    public interface IFinance
    {
        Task<IEnumerable<Quote>> GetQuotes(List<string> ticks);
        Task<QuoteEvolution> GetQuoteEvolution(string tick, DateTime initialDate, DateTime finalDate, Periodicity periodicity);
    }

    public class Quote
    {
        public string Tick { get; set; }
        public double? CurrentQuote { get; set; }
        public DateTime? DateTime { get; set; }
        public long? Volume { get; set; } // Number of shares exchanged

        public override string ToString()
        {
            return string.Format("{0} ${1} - {2}", Tick, CurrentQuote, DateTime);
        }
    }

    public class QuoteEvolution
    {
        public string Tick { get; set; }
        public List<Quote> Quotes { get; set; } 

        public class Quote
        {
            public DateTime Date { get; set; }
            public double Open { get; set; }
            public double High { get; set; }
            public double Low { get; set; }
            public double Close { get; set; }
            public long? Volume { get; set; } // Number of shares exchanged
            public double AdjClose { get; set; } // Adjusted closing price

            public override string ToString()
            {
                return string.Format("${0} - {1}", AdjClose, Date);
            }
        }

        public override string ToString()
        {
            return string.Format("{0} ({1})", Tick, Quotes.Count);
        }
    }

    public enum Periodicity
    {
        Daily,
        Weekly,
        Monthly
    }
}
