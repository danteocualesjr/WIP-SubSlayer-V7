import React, { useState } from 'react';
import { X, Sword, ExternalLink, AlertTriangle, ArrowRight } from 'lucide-react';
import { Subscription } from '../../types/subscription';

interface CancellationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscription: Subscription | null;
}

const CancellationConfirmModal: React.FC<CancellationConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subscription
}) => {
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen || !subscription) return null;

  // Common cancellation URLs for popular services
  const getCancellationUrl = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    
    const cancellationUrls: Record<string, string> = {
      'netflix': 'https://www.netflix.com/cancelplan',
      'spotify': 'https://www.spotify.com/account/subscription/',
      'apple music': 'https://support.apple.com/en-us/HT202039',
      'amazon prime': 'https://www.amazon.com/gp/help/customer/display.html?nodeId=201910200',
      'disney+': 'https://help.disneyplus.com/csp?id=csp_article_content&sys_kb_id=d8443f4bdb7ac8109210c5ce9d9619eb',
      'hulu': 'https://help.hulu.com/s/article/cancel-subscription',
      'youtube premium': 'https://support.google.com/youtube/answer/6308278',
      'adobe': 'https://helpx.adobe.com/manage-account/using/cancel-subscription.html',
      'microsoft 365': 'https://support.microsoft.com/en-us/office/cancel-your-microsoft-365-subscription-46e2634c-c64b-4c65-94b9-2cc9c960e91b',
      'dropbox': 'https://help.dropbox.com/accounts-billing/billing/cancel-subscription',
      'zoom': 'https://support.zoom.us/hc/en-us/articles/201362173-How-Do-I-Cancel-My-Subscription-',
      'slack': 'https://slack.com/help/articles/203953146-Manage-billing-and-payment-for-your-workspace',
      'github': 'https://docs.github.com/en/billing/managing-billing-for-your-github-account/downgrading-your-github-subscription',
      'chatgpt': 'https://help.openai.com/en/articles/7039783-how-can-i-cancel-my-chatgpt-plus-subscription',
      'openai': 'https://help.openai.com/en/articles/7039783-how-can-i-cancel-my-chatgpt-plus-subscription',
      'notion': 'https://www.notion.so/help/cancel-subscription',
      'figma': 'https://help.figma.com/hc/en-us/articles/360040328273-Manage-billing-and-team-subscription',
      'canva': 'https://www.canva.com/help/cancel-subscription/',
      'grammarly': 'https://support.grammarly.com/hc/en-us/articles/115000090792-Cancel-subscription',
      'lastpass': 'https://support.logmeininc.com/lastpass/help/cancel-your-lastpass-subscription-lp010067',
      '1password': 'https://support.1password.com/cancel-subscription/',
      'dashlane': 'https://support.dashlane.com/hc/en-us/articles/202625042-Cancel-your-subscription',
      'evernote': 'https://help.evernote.com/hc/en-us/articles/208313748-How-to-cancel-your-Evernote-subscription',
      'trello': 'https://support.atlassian.com/trello/docs/how-to-cancel-your-trello-subscription/',
      'asana': 'https://asana.com/guide/help/premium/billing#gl-cancel',
      'monday.com': 'https://support.monday.com/hc/en-us/articles/115005310425-Billing-and-subscription-management',
      'mailchimp': 'https://mailchimp.com/help/cancel-account/',
      'constant contact': 'https://knowledgebase.constantcontact.com/articles/KnowledgeBase/5865-cancel-account',
      'hubspot': 'https://knowledge.hubspot.com/account/cancel-your-hubspot-subscription',
      'salesforce': 'https://help.salesforce.com/s/articleView?id=sf.admin_cancel.htm',
      'quickbooks': 'https://quickbooks.intuit.com/learn-support/en-us/help-article/account-management/cancel-quickbooks-online-subscription/L7Wfkq9eI_US_en_US',
      'freshbooks': 'https://www.freshbooks.com/support/how-to-cancel-your-freshbooks-account',
      'xero': 'https://central.xero.com/s/article/Cancel-your-Xero-subscription',
      'wave': 'https://support.waveapps.com/hc/en-us/articles/208621426-Cancel-your-Wave-subscription',
      'shopify': 'https://help.shopify.com/en/manual/your-account/close-account',
      'squarespace': 'https://support.squarespace.com/hc/en-us/articles/205812378-Canceling-your-account',
      'wix': 'https://support.wix.com/en/article/canceling-a-premium-plan',
      'wordpress': 'https://wordpress.com/support/cancel-plan/',
      'webflow': 'https://university.webflow.com/lesson/cancel-subscription',
      'audible': 'https://www.audible.com/ep/memberbenefits',
      'kindle unlimited': 'https://www.amazon.com/gp/help/customer/display.html?nodeId=201556940',
      'paramount+': 'https://help.paramountplus.com/s/article/PD-How-do-I-cancel-my-subscription',
      'peacock': 'https://www.peacocktv.com/help/article/how-to-cancel-peacock-premium',
      'hbo max': 'https://help.hbomax.com/us/Answer/Detail/000001174',
      'discovery+': 'https://help.discoveryplus.com/hc/en-us/articles/360055063274-How-do-I-cancel-my-subscription-',
      'crunchyroll': 'https://help.crunchyroll.com/hc/en-us/articles/360022779451-How-do-I-cancel-my-subscription-',
      'funimation': 'https://help.funimation.com/hc/en-us/articles/115003056747-How-do-I-cancel-my-subscription-',
      'vrv': 'https://help.vrv.co/hc/en-us/articles/360024868972-How-do-I-cancel-my-subscription-',
      'twitch': 'https://help.twitch.tv/s/article/how-to-cancel-twitch-subscriptions',
      'patreon': 'https://support.patreon.com/hc/en-us/articles/204606315-How-do-I-cancel-my-pledges-',
      'onlyfans': 'https://onlyfans.com/help',
      'masterclass': 'https://help.masterclass.com/hc/en-us/articles/115004756506-How-do-I-cancel-my-subscription-',
      'skillshare': 'https://help.skillshare.com/hc/en-us/articles/201670244-How-to-Cancel-Your-Membership',
      'udemy': 'https://support.udemy.com/hc/en-us/articles/229604248-Canceling-Your-Subscription',
      'coursera': 'https://learner.coursera.help/hc/en-us/articles/208280266-Cancel-a-subscription',
      'linkedin learning': 'https://www.linkedin.com/help/learning/answer/a507663',
      'pluralsight': 'https://help.pluralsight.com/help/cancel-subscription',
      'codecademy': 'https://help.codecademy.com/hc/en-us/articles/360008174214-How-do-I-cancel-my-subscription-',
      'treehouse': 'https://teamtreehouse.com/library/how-to-cancel-your-subscription',
      'datacamp': 'https://support.datacamp.com/hc/en-us/articles/360002080134-How-to-cancel-your-subscription',
      'brilliant': 'https://brilliant.org/premium/',
      'duolingo': 'https://support.duolingo.com/hc/en-us/articles/360036187894-How-do-I-cancel-Super-Duolingo-',
      'babbel': 'https://support.babbel.com/hc/en-us/articles/205774997-How-can-I-cancel-my-subscription-',
      'rosetta stone': 'https://support.rosettastone.com/en/articles/115002087-How-do-I-cancel-my-subscription',
      'headspace': 'https://help.headspace.com/hc/en-us/articles/115006586748-How-do-I-cancel-my-subscription-',
      'calm': 'https://help.calm.com/hc/en-us/articles/115008116287-How-do-I-cancel-my-subscription-',
      'meditation studio': 'https://meditationstudioapp.com/support',
      'ten percent happier': 'https://support.tenpercent.com/hc/en-us/articles/360002870174-How-do-I-cancel-my-subscription-',
      'insight timer': 'https://insighttimer.com/support',
      'peloton': 'https://support.onepeloton.com/hc/en-us/articles/203313173-How-to-Cancel-Your-All-Access-Membership',
      'nike training club': 'https://www.nike.com/help/a/cancel-nike-membership',
      'fitbit premium': 'https://help.fitbit.com/articles/en_US/Help_article/2439.htm',
      'myfitnesspal': 'https://support.myfitnesspal.com/hc/en-us/articles/360032625391-How-do-I-cancel-my-Premium-subscription-',
      'strava': 'https://support.strava.com/hc/en-us/articles/216918967-How-to-Cancel-Strava-Summit',
      'noom': 'https://web.noom.com/support/2016/09/how-do-i-cancel-my-subscription/',
      'weight watchers': 'https://www.weightwatchers.com/us/find-a-meeting/customer-service',
      'beachbody': 'https://faq.beachbody.com/app/answers/detail/a_id/1992/~/how-do-i-cancel-my-beachbody-on-demand-subscription%3F',
      'daily burn': 'https://dailyburn.com/support',
      'classpass': 'https://support.classpass.com/hc/en-us/articles/115004647908-How-do-I-pause-or-cancel-my-membership-',
      'soulcycle': 'https://support.soul-cycle.com/hc/en-us/articles/115004647908-How-do-I-pause-or-cancel-my-membership-',
      'orangetheory': 'https://www.orangetheory.com/en-us/membership/',
      'planet fitness': 'https://www.planetfitness.com/gyms',
      'la fitness': 'https://www.lafitness.com/Pages/MemberServices.aspx',
      '24 hour fitness': 'https://www.24hourfitness.com/membership/membership_options/',
      'equinox': 'https://www.equinox.com/membership',
      'crunch fitness': 'https://www.crunch.com/membership',
      'anytime fitness': 'https://www.anytimefitness.com/membership/',
      'gold\'s gym': 'https://www.goldsgym.com/membership/',
      'lifetime fitness': 'https://www.lifetime.life/membership.html'
    };

    // Try exact match first
    if (cancellationUrls[name]) {
      return cancellationUrls[name];
    }

    // Try partial matches
    for (const [key, url] of Object.entries(cancellationUrls)) {
      if (name.includes(key) || key.includes(name)) {
        return url;
      }
    }

    return null;
  };

  const suggestedUrl = getCancellationUrl(subscription.name);
  const finalUrl = customUrl || suggestedUrl;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    onConfirm();
    onClose();
  };

  const handleOpenCancellationPage = () => {
    if (finalUrl) {
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Sword className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Cancel Subscription</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Subscription Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                style={{ backgroundColor: subscription.color || '#8B5CF6' }}
              >
                {subscription.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{subscription.name}</h4>
                <p className="text-sm text-gray-600">
                  ${subscription.cost.toFixed(2)} {subscription.billingCycle}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-900 mb-1">Ready to cancel?</h4>
                <p className="text-sm text-orange-800">
                  You'll need to cancel this subscription directly with {subscription.name}. 
                  We'll help you get there and mark it as cancelled in your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation URL Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cancellation Page
            </label>
            
            {suggestedUrl ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Found cancellation page</span>
                  </div>
                  <p className="text-xs text-green-700 break-all">{suggestedUrl}</p>
                </div>
                
                <div className="text-center">
                  <span className="text-xs text-gray-500">or</span>
                </div>
                
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="Enter custom cancellation URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">No automatic link found</span>
                  </div>
                  <p className="text-xs text-yellow-700">
                    Please enter the cancellation URL for {subscription.name} below
                  </p>
                </div>
                
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder={`Enter ${subscription.name} cancellation URL`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {finalUrl && (
              <button
                onClick={handleOpenCancellationPage}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Go to Cancellation Page</span>
              </button>
            )}
            
            <button
              onClick={handleConfirmCancel}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Sword className="w-5 h-5" />
              <span>Mark as Cancelled in Dashboard</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 py-2 font-medium transition-colors"
            >
              Keep Subscription Active
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            💡 Tip: Bookmark the cancellation page for future reference
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancellationConfirmModal;