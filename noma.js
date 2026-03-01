const { useState } = React;

function formatZar(amount){
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);
}

function App() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    message: ''
  });
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [orderMap, setOrderMap] = useState({});

  const menuItems = [
    {
      title: 'Signature Beef Burger',
      desc: 'Grilled beef patty, cheddar, caramelized onions and our smoky Noma sauce.',
      priceZar: 97.04,
      img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: 'Crispy Chicken Combo',
      desc: 'Crunchy chicken strips, golden fries and a refreshing soda.',
      priceZar: 105.14,
      img: 'https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=900'
    },
    {
      title: 'Loaded Street Fries',
      desc: 'Crispy fries topped with cheese, spicy mince, jalapeños and herbs.',
      priceZar: 69.50,
      img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80'
    }
  ];

  const selectedOrderItems = menuItems
    .map((item) => ({
      ...item,
      qty: Number(orderMap[item.title] || 0)
    }))
    .filter((item) => item.qty > 0);

  const orderTotalZar = selectedOrderItems.reduce((sum, item) => sum + (item.priceZar * item.qty), 0);

  const addToOrder = (title) => {
    setOrderMap((prev) => ({ ...prev, [title]: Number(prev[title] || 0) + 1 }));
  };

  const changeOrderQty = (title, delta) => {
    setOrderMap((prev) => {
      const nextQty = Math.max(0, Number(prev[title] || 0) + delta);
      const out = { ...prev };
      if(nextQty === 0) delete out[title];
      else out[title] = nextQty;
      return out;
    });
  };

  const clearOrder = () => setOrderMap({});

  const testimonials = [
    { text: 'Best quick meal in town. Fast, fresh and full of flavor every time.', by: 'Ayanda M., regular customer' },
    { text: 'The burger quality is top-tier and the service is always friendly.', by: 'Sibusiso D., office manager' },
    { text: 'Their family combos save us every weekend. Highly recommended.', by: 'Nomsa N., local resident' }
  ];

  const onInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice({ type: '', text: '' });

    try {
      const res = await fetch('noma_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          orderItems: selectedOrderItems.map((item) => ({
            title: item.title,
            qty: item.qty,
            unitPriceZar: Number(item.priceZar.toFixed(2)),
            lineTotalZar: Number((item.priceZar * item.qty).toFixed(2))
          })),
          orderTotalZar: Number(orderTotalZar.toFixed(2))
        })
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not submit booking request.');
      }

      setNotice({ type: 'ok', text: 'Booking request sent successfully. Noma team will contact you shortly.' });
      setFormData({ name: '', phone: '', date: '', time: '', guests: '2', message: '' });
      clearOrder();
    } catch (err) {
      setNotice({ type: 'err', text: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <header>
        <div className="container nav">
          <div className="brand">Noma's <span>Fast Food</span></div>
          <nav className="nav-links">
            <a href="#menu">Menu</a>
            <a href="#about">About</a>
            <a href="#gallery">Gallery</a>
            <a href="#book">Book</a>
            <button className="btn btn-primary" onClick={() => document.getElementById('book').scrollIntoView({ behavior: 'smooth' })}>Order / Book</button>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <h1>Fast, Fresh & Full of Flavor at Noma's</h1>
              <p>
                Welcome to Noma's Fast Food Restaurant — a trusted local favorite serving bold meals,
                quick service and consistent quality. Proudly serving a growing community with over
                <strong> 1300+ happy customers</strong>.
              </p>
              <div className="badges">
                <span className="badge">Open Daily: 09:00 - 22:00</span>
                <span className="badge">Dine-in & Takeaway</span>
                <span className="badge">Family Friendly</span>
              </div>
              <div className="stats">
                <div className="stat">
                  <div className="value">1300+</div>
                  <div className="label">Happy Customers</div>
                </div>
                <div className="stat">
                  <div className="value">4.8/5</div>
                  <div className="label">Average Rating</div>
                </div>
                <div className="stat">
                  <div className="value">8 min</div>
                  <div className="label">Average Service Time</div>
                </div>
              </div>
            </div>
            <div>
              <img
                className="hero-image"
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80"
                alt="Noma's Fast Food interior"
              />
            </div>
          </div>
        </section>

        <section id="menu">
          <div className="container">
            <h2 className="section-title">Popular Menu</h2>
            <p className="section-sub">Freshly prepared favorites that keep our customers coming back.</p>
            <div className="cards">
              {menuItems.map((item) => (
                <article className="card" key={item.title}>
                  <img src={item.img} alt={item.title} />
                  <div className="card-body">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <div className="price">{formatZar(item.priceZar)}</div>
                    <div className="order-actions">
                      <button className="btn btn-primary" type="button" onClick={() => addToOrder(item.title)}>Add to Order</button>
                      {!!orderMap[item.title] && (
                        <div className="qty-pill">
                          <button type="button" onClick={() => changeOrderQty(item.title, -1)}>-</button>
                          <span>{orderMap[item.title]}</span>
                          <button type="button" onClick={() => changeOrderQty(item.title, 1)}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about">
          <div className="container grid-2">
            <div>
              <h2 className="section-title">About Noma's</h2>
              <p className="section-sub">
                Noma's Fast Food Restaurant is built on one promise: premium taste, quick service,
                and welcoming hospitality. We focus on quality ingredients, clean preparation,
                and a professional service experience for every customer.
              </p>
              <p className="section-sub">
                Whether you're grabbing lunch, dining with family, or ordering for a team,
                Noma's delivers fast food done right.
              </p>
            </div>
            <div className="testimonial">
              <p>"Our mission is simple: serve food people trust, at a speed they love, with quality they can taste."</p>
              <small>— Noma, Founder</small>
            </div>
          </div>
        </section>

        <section id="gallery" className="gallery">
          <div className="container">
            <h2 className="section-title">Restaurant Gallery</h2>
            <div className="grid-2">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80" alt="Restaurant seating" />
              <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80" alt="Customers dining" />
            </div>
          </div>
        </section>

        <section>
          <div className="container">
            <h2 className="section-title">What Customers Say</h2>
            <div className="cards">
              {testimonials.map((t, idx) => (
                <div className="testimonial" key={idx}>
                  <p>{t.text}</p>
                  <small>{t.by}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="book">
          <div className="container">
            <h2 className="section-title">Book a Table / Place Large Orders</h2>
            <p className="section-sub">Send your details and our team will confirm your booking quickly.</p>

            <div className="order-summary">
              <h3>Your Order</h3>
              {selectedOrderItems.length === 0 ? (
                <p className="muted-text">No items selected yet. Add items from Popular Menu.</p>
              ) : (
                <>
                  {selectedOrderItems.map((item) => (
                    <div className="order-row" key={item.title}>
                      <div>{item.title} × {item.qty}</div>
                      <div>{formatZar(item.priceZar * item.qty)}</div>
                    </div>
                  ))}
                  <div className="order-total">Total: {formatZar(orderTotalZar)}</div>
                </>
              )}
            </div>

            <form className="form-card" onSubmit={submitBooking}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" value={formData.name} onChange={onInput} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phone" value={formData.phone} onChange={onInput} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={formData.date} onChange={onInput} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" name="time" value={formData.time} onChange={onInput} required />
                </div>
                <div className="form-group">
                  <label>Guests</label>
                  <select name="guests" value={formData.guests} onChange={onInput}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6+">6+</option>
                  </select>
                </div>
                <div className="form-group form-full">
                  <label>Special Request (Optional)</label>
                  <textarea name="message" value={formData.message} onChange={onInput} placeholder="Birthday setup, large order details, etc."></textarea>
                </div>
              </div>

              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Submit Booking Request'}
              </button>

              {notice.text && (
                <div className={`notice ${notice.type === 'ok' ? 'ok' : 'err'}`}>
                  {notice.text}
                </div>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          © {new Date().getFullYear()} Noma's Fast Food Restaurant • 125 Main Street • +27 11 000 1234
        </div>
      </footer>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
