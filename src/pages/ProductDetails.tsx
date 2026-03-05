import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ShoppingCart, ArrowLeft, Shield, Truck, RefreshCcw, MessageSquare, HelpCircle, Send, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils';
import { useState, useEffect } from 'react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart, products, currentUser, addReview, addQuestion, orders } = useStore();
  const product = products.find(p => p.id === id);
  const [activeImage, setActiveImage] = useState(product?.image || '');
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'questions'>('details');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'questions' || tab === 'reviews' || tab === 'details') {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  // Question form state
  const [questionText, setQuestionText] = useState('');
  
  // Quantity state
  const [quantity, setQuantity] = useState(1);

  const hasBoughtProduct = orders.some(order => 
    order.userId === currentUser?.id && 
    order.items.some(item => item.id === id)
  );

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="pt-40 text-center space-y-4">
        <h2 className="text-2xl">Product not found</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary">Back to Shop</button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Image Gallery */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden border border-primary/10 bg-bg-base"
          >
            {activeImage && (
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {(product.images || [product.image]).map((img, i) => (
              <button 
                key={i}
                onClick={() => setActiveImage(img)}
                className={`aspect-square rounded-lg overflow-hidden border transition-all duration-300 ${activeImage === img ? 'border-primary' : 'border-primary/10 opacity-50 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                {product.category}
              </span>
            </div>
            <h1 className="text-5xl font-display font-bold leading-tight">{product.name}</h1>
            <p className="text-3xl font-display font-bold text-primary">{formatPrice(product.price)}</p>
            <p className="opacity-60 leading-relaxed text-lg">{product.description}</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-primary/20 rounded-xl overflow-hidden bg-bg-base scale-90 origin-left">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-primary/10 transition-colors text-base font-bold"
                >
                  -
                </button>
                <span className="px-5 py-2 font-bold text-base border-x border-primary/10 min-w-[50px] text-center">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-primary/10 transition-colors text-base font-bold"
                >
                  +
                </button>
              </div>
              <button 
                onClick={() => addToCart(product, quantity)}
                className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-3"
              >
                Add to Cart
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Shield, label: "Quality Guaranteed" },
                { icon: Truck, label: "Safe Shipping" },
                { icon: RefreshCcw, label: "Easy Returns" }
              ].map((item, i) => (
                <div key={i} className="border border-primary/10 rounded-xl p-4 flex flex-col items-center gap-2 text-center bg-bg-base">
                  <item.icon className="w-5 h-5 opacity-40" />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8 border-b border-primary/10 pt-8">
            {['details', 'reviews', 'questions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? 'text-primary' : 'opacity-40 hover:opacity-100'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-8">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-xl">Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(product.specs || {}).map(([key, value]) => (
                    <div key={key} className="p-4 rounded-lg flex flex-col gap-1 border border-primary/10 bg-bg-base">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">{key}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h3 className="font-display font-semibold text-xl mb-1">Customer Reviews</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <span className="text-sm font-bold">{product.rating} / 5.0</span>
                      <span className="text-xs opacity-40">({product.reviews} reviews)</span>
                    </div>
                  </div>
                  
                  {currentUser && hasBoughtProduct && (
                    <button 
                      onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="btn-outline py-2 px-6 text-xs"
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {(product.productReviews || []).length === 0 ? (
                    <p className="text-center py-12 opacity-40 italic">No reviews yet. Be the first to share your thoughts!</p>
                  ) : (
                    (product.productReviews || []).map((review) => (
                      <div key={review.id} className="p-6 rounded-2xl border border-primary/10 bg-bg-base space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{review.userName}</p>
                              <p className="text-[10px] opacity-40 uppercase tracking-widest">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex text-primary">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : ''}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm opacity-70 leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {currentUser && hasBoughtProduct && (
                  <div id="review-form" className="p-8 rounded-2xl border border-primary/20 bg-primary/5 space-y-6">
                    <h4 className="font-display font-bold text-lg">Share Your Experience</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-50">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                              key={star}
                              onClick={() => setReviewRating(star)}
                              className={`p-1 transition-colors ${reviewRating >= star ? 'text-primary' : 'opacity-20 hover:opacity-50'}`}
                            >
                              <Star className={`w-6 h-6 ${reviewRating >= star ? 'fill-current' : ''}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-50">Your Review</label>
                        <textarea 
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="What did you think of the product?"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary h-32 resize-none"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          if (!reviewComment.trim()) return;
                          addReview(product.id, {
                            userId: currentUser.id,
                            userName: currentUser.name,
                            rating: reviewRating,
                            comment: reviewComment
                          });
                          setReviewComment('');
                        }}
                        className="btn-primary py-3 px-8 text-sm"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                )}

                {currentUser && !hasBoughtProduct && (
                  <div className="p-6 rounded-2xl border border-dashed border-primary/20 text-center">
                    <p className="text-sm opacity-50">Only verified buyers can leave a review.</p>
                  </div>
                )}

                {!currentUser && (
                  <div className="p-6 rounded-2xl border border-dashed border-primary/20 text-center">
                    <p className="text-sm opacity-50">Please <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">login</button> to leave a review.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-semibold text-xl">Product Q&A</h3>
                  <span className="text-xs opacity-40 font-bold uppercase tracking-widest">
                    {(product.questions || []).length} Questions
                  </span>
                </div>

                <div className="space-y-6">
                  {(product.questions || []).length === 0 ? (
                    <p className="text-center py-12 opacity-40 italic">No questions yet. Have a doubt? Ask away!</p>
                  ) : (
                    (product.questions || []).map((q) => (
                      <div key={q.id} className="space-y-4">
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <HelpCircle className="w-4 h-4 opacity-40" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold">{q.text}</p>
                            <p className="text-[10px] opacity-30 uppercase tracking-widest">Asked by {q.userName} • {new Date(q.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {q.answer && (
                          <div className="ml-12 p-4 rounded-xl bg-primary/5 border-l-2 border-primary space-y-2">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-3 h-3 text-primary" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">T Mart Official Answer</span>
                            </div>
                            <p className="text-sm opacity-70">{q.answer}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-8 border-t border-primary/10">
                  <h4 className="font-display font-bold text-lg mb-6">Ask a Question</h4>
                  {currentUser ? (
                    <div className="relative">
                      <input 
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Type your question here..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:border-primary transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && questionText.trim()) {
                            addQuestion(product.id, {
                              userId: currentUser.id,
                              userName: currentUser.name,
                              text: questionText
                            });
                            setQuestionText('');
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          if (!questionText.trim()) return;
                          addQuestion(product.id, {
                            userId: currentUser.id,
                            userName: currentUser.name,
                            text: questionText
                          });
                          setQuestionText('');
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border border-dashed border-primary/20 text-center">
                      <p className="text-sm opacity-50">Please <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">login</button> to ask a question.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
