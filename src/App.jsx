import { useState, useMemo, useCallback, useEffect } from "react";
import { supabase } from "./supabase";

const T = "#008080";
const TD = "#004d4d";
const TL = "#e6f5f5";

const SEED = [
  {lcid:"150133",name:"Alice M. B. Bailey",aka:"Alice Marie Beeson Bailey",legal:"18-242-21",tract:"229",gross:50,or_acres:0.01653,net:0.017,status:"Offer Mailed",phone:"(318) 726-4138",email:"",address:"220 Crossroads Loop",city:"Farmerville",state:"LA",zip:"71241",redline:"",lp_comments:"",comments:"4/23/2026 : Contact info found: (318) 726-4138||3/28/2026 : Delivered Thursday March 26 at 1:14 P.M.||3/21/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540299158775||3/11/2026 : Adverse complete: Open to Lease.||3/10/2026 : Currently Adversing"},
  {lcid:"150134",name:"Allan Hamilton",aka:"Heir of James Manley Morris",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0372,net:0.037,status:"Offer Mailed",phone:"",email:"",address:"277 Stockton Dr., Loveland CO",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/27/2026 : ADH needed for Eunice B. Smith Hamilton.||4/9/2026 : Mailed lease offer via UPS, Tracking # 1ZR9Y9540298011915"},
  {lcid:"150137",name:"Anita Kupke",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.14881,net:0.149,status:"Leased to 3rd party",phone:"",email:"",address:"",city:"",state:"",zip:"",redline:"Not leasable as per JC",lp_comments:"",comments:"4/28/2026 : Unleasable. Signed lease with SEP 3/4/2026."},
  {lcid:"149290",name:"Arlene May Schumacher",aka:"Arlene M. Heaton",legal:"18-242-21",tract:"229",gross:50,or_acres:0.59524,net:0.595,status:"RTS",phone:"(352) 489-1115",email:"",address:"22978 SW 117th",city:"Dunnellon",state:"FL",zip:"34431",redline:"",lp_comments:"",comments:"4/28/2026 : Attempted phone contact. No answer.||3/28/2026 : Package returned to sender. 1ZR9Y9541298195824||3/20/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540298195825"},
  {lcid:"150149",name:"Arthur E. Jones",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.11161,net:0.1115,status:"Deceased",phone:"",email:"",address:"263 Rapids View Ln.",city:"Buckhannon",state:"WV",zip:"26201",redline:"",lp_comments:"Will 57@183 Probated Yes",comments:"4/28/2026 : Deceased. Looking for heirs.||3/9/2026 : DECEASED 2018. LWT 122-436. Probate needed. Heirs: Virginia Ann Ellis Jones, Charles Travis Jones, Stephanie Ann Jones Smith."},
  {lcid:"149298",name:"Betty A. Dewey",aka:"Betty A. Dewey Nee Chestnut",legal:"18-242-21",tract:"229",gross:50,or_acres:0.714286,net:0.7145,status:"Executed Document Received",phone:"941-201-2572",email:"badewey@hotmail.com",address:"730 South Osprey Ave., Apt B-120",city:"Sarasota",state:"FL",zip:"34236",redline:"",lp_comments:"",comments:"4/28/2026 : Needs vesting deed for check request.||3/31/2026 : Mailed lease to corrected address. UPS Tracking# 1ZR9Y9540292199421||3/26/2026 : Betty confirmed address. Phone: 941-201-2572. email: badewey@hotmail.com||3/20/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540291836878"},
  {lcid:"150069",name:"Betty D. Scheblo",aka:"",legal:"5-14-36.1, 5-14-36",tract:"4205, 4206",gross:34.1974,or_acres:null,net:6.39749,status:"Executed Document Received",phone:"",email:"",address:"",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/28/2026 : Executed Documents received 4/16. Needs VDs and LWTs/ADHs.||3/20/2026 : Mailed Lease Offer with approved payment."},
  {lcid:"150160",name:"Betty June McIntyre Smith",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.11161,net:0.1115,status:"RTS",phone:"(304) 843-1035",email:"",address:"2200 Floral Street",city:"Moundsville",state:"WV",zip:"26041",redline:"",lp_comments:"",comments:"4/28/2026 : Attempted Contact 304-843-1035. Not correct number.||3/21/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540295886692"},
  {lcid:"150163",name:"Betty Wright",aka:"Betty Lee Bailey",legal:"18-242-21, 18-242-20",tract:"229, 3052",gross:124,or_acres:0.14399,net:0.14389,status:"Offer Mailed",phone:"",email:"",address:"22230 Nortrail Strongsville OH 44149",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/9/2026 : Mailed lease offer via UPS, tracking # 1ZR9Y9540292978651"},
  {lcid:"150174",name:"Bonnell 'Bonnie' Lee Bond",aka:"Heir of James Gordon Bond, Ethel Bond",legal:"18-242-21",tract:"229",gross:50,or_acres:0.22321,net:0.223,status:"Executed Document Received",phone:"",email:"",address:"135 Theresa Dr.",city:"Weirton",state:"WV",zip:"26062",redline:"",lp_comments:"",comments:"4/28/2026 : Called Bonny about retraction letter. Left voicemail.||3/31/2026 : Mailed retraction letter. UPS Tracking 1ZR9Y9540297424034||3/20/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540295956026"},
  {lcid:"144361",name:"Brenda J. Boggess",aka:"",legal:"p/o 14-164-40, p/o 14-164-23",tract:"31059, 786",gross:102.16,or_acres:null,net:10.45993,status:"Offer Mailed",phone:"304-641-6675",email:"chad.n.boggess@icloud.com",address:"3101 Main Street",city:"Lumberport",state:"WV",zip:"26386",redline:"",lp_comments:"",comments:"4/17/2026 : Brenda and Chad ready for finalized lease.||11/17/2025 : Mailed initial lease offer. UPS tracking #1ZR9Y9540294097279"},
  {lcid:"150182",name:"Brenda Sue McClintock",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0496,net:0.0495,status:"Offer Mailed",phone:"",email:"",address:"1105 Avenue H",city:"Ely",state:"NV",zip:"89301",redline:"",lp_comments:"",comments:"4/1/2026 : Mailed Lease Offer via UPS: Tracking # 1ZR9Y9540299942837"},
  {lcid:"150184",name:"Brian D. Gawthrop",aka:"",legal:"18-242-20, 18-242-21",tract:"3052, 229",gross:124,or_acres:0.036,net:0.0361,status:"Offer Mailed",phone:"(206) 850-0962",email:"",address:"11233 Northeast 58th Place",city:"Kirkland",state:"VA",zip:"98033",redline:"",lp_comments:"",comments:"4/28/2026 : Contact info: (206) 850-0962||3/27/2026 : Mailed Lease Offer via UPS. Tracking # 1ZR9Y9540291028661"},
  {lcid:"144999",name:"Brittany Senior",aka:"",legal:"14-202-3",tract:"527",gross:157.48,or_acres:null,net:1.74978,status:"Drop/HBP",phone:"409-771-2134",email:"brittanysenior46@gmail.com",address:"1701 Hermann Dr. #2601",city:"Houston",state:"TX",zip:"77004",redline:"",lp_comments:"",comments:"4/28/2026 : Executed documents received 4/24/2026.||1/25/2026 : Lease Delivered UPS 1ZR9Y9543592712296"},
  {lcid:"145007",name:"Carl B. and Kathy J. Floyd",aka:"",legal:"14-244-37, 14-244-38",tract:"84",gross:1.7225,or_acres:null,net:1.61467,status:"Committed to Lease",phone:"304-783-4633",email:"",address:"4298 Trouser Leg Rd.",city:"Wallace",state:"WV",zip:"26448",redline:"",lp_comments:"",comments:"4/16/2026 : Scheduled Lease signing visit for 10:30am 4/17.||1/20/2026 : Mailed lease packet UPS tracking # 1ZR9Y9540296442847"},
  {lcid:"150194",name:"Carol Hickman Haillsey",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.02205,net:0.022,status:"RTS",phone:"(570) 476-5486",email:"",address:"90 East Catawissa St. #305",city:"Nesquehoning",state:"PA",zip:"18240",redline:"",lp_comments:"",comments:"4/23/2026 : Contact info: (570) 476-5486||3/21/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540291207860"},
  {lcid:"150195",name:"Carol Sharpe",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0496,net:0.0495,status:"Executed Document Received",phone:"(828) 241-2972",email:"",address:"1562 Murrays Road, Catawba NC",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/20/2026 : Needs ADHs for Viola Mae Nuzum, Clacey George Nuzum, Edward Blair Nuzum.||4/9/2026 : Mailed lease offer via UPS, tracking # 1ZR9Y9540295907981"},
  {lcid:"150197",name:"Carolyn Herring",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.22321,net:0.2235,status:"Offer Mailed",phone:"(713) 991-4864",email:"",address:"12933 Pembroke St., Trlr 10",city:"Houston",state:"TX",zip:"77048",redline:"",lp_comments:"",comments:"4/28/2026 : Attempted phone contact (713) 991-4864.||3/20/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540296491982"},
  {lcid:"150207",name:"Charles Frederick Bailey",aka:"",legal:"18-242-20, 18-242-21",tract:"3052, 229",gross:124,or_acres:0.14399,net:0.14389,status:"Deceased",phone:"239-370-0587",email:"",address:"3426 Winifred Row Lane, Apt. 3303",city:"Naples",state:"FL",zip:"34104",redline:"",lp_comments:"Obituary Sept 23 2021 Salem WV. Heirs: Alva B. Bailey HEIR, Daniel W. Bailey HEIR",comments:"3/9/2026 : Deceased DOD 2021. Heirs: Alva B. Bailey, Daniel W. Bailey."},
  {lcid:"149339",name:"Cherie Alderson Bunting",aka:"Heir of Pauline Mable Bond Barnard",legal:"18-242-21",tract:"229",gross:50,or_acres:0.44643,net:0.4465,status:"Offer Mailed",phone:"(714) 968-5058",email:"",address:"18336 Tamarind",city:"Fountain Valley",state:"CA",zip:"92708",redline:"",lp_comments:"",comments:"4/28/2026 : Deceased. Cheri Alderson-Bunting died October 26 2024.||3/20/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540293582531"},
  {lcid:"145025",name:"Cheryl B. & Creel S. Cornwell",aka:"JTWROS",legal:"p/o 14-223-27",tract:"22700",gross:76,or_acres:null,net:5.42857,status:"Offer Mailed",phone:"304-844-0991",email:"suesv2011@aol.com",address:"220 Buckhannon Ave",city:"Clarksburg",state:"WV",zip:"26301",redline:"",lp_comments:"",comments:"4/17/2026 : Emailed approved NGL lease to Bill Suan."},
  {lcid:"149343",name:"Cheryl L. Smith",aka:"",legal:"18-242-20, 18-242-21",tract:"3052, 229",gross:124,or_acres:0.57596,net:0.57605,status:"Offer Mailed",phone:"",email:"",address:"5009 Wood Valley Dr",city:"Taleigh",state:"NC",zip:"27613",redline:"",lp_comments:"",comments:"4/28/2026 : Approved $3500/18%. Drafting lease.||3/27/2026 : Mailed Lease offer via UPS. Tracking # 1ZR9Y9540290526302"},
  {lcid:"144368",name:"Chester C. Jr. Yeater Family Trust",aka:"Revocable Trust 11/08/2010",legal:"14-164-4, 14-164-19, 14-164-20",tract:"6751, 785",gross:154.36666,or_acres:null,net:21.26574,status:"Offer Mailed",phone:"304-670-3306",email:"roscoewilson@comcast.net",address:"PO BOX 795",city:"New Cumberland",state:"WV",zip:"26047",redline:"",lp_comments:"",comments:"4/17/2026 : Email regarding title concerns."},
  {lcid:"145029",name:"Christina D. Moneypenny",aka:"Christi Moneypenny",legal:"18-2611-2, 18-2611-11",tract:"664, 683, 684",gross:7.5,or_acres:null,net:3.75,status:"Offer Mailed",phone:"",email:"",address:"18 Gain Street",city:"Salem",state:"WV",zip:"26426",redline:"",lp_comments:"",comments:"4/20/2026 : Delivered Monday April 06.||3/25/2026 : Mailed Lease Offer. UPS Tracking #1ZR9Y9540297691424"},
  {lcid:"145032",name:"City of Salem",aka:"",legal:"9-144-16",tract:"340",gross:2.49,or_acres:null,net:2.49,status:"Offer Mailed",phone:"",email:"",address:"P.O. Box 352",city:"Salem",state:"WV",zip:"26426",redline:"",lp_comments:"",comments:"4/20/2026 : Brandie Garner left voicemail.||3/23/2026 : Mailed Lease Offer to PO Box via USPS."},
  {lcid:"144369",name:"Clarence Lowe Jr. Life Estate",aka:"",legal:"",tract:"22745",gross:30,or_acres:null,net:7.5,status:"Re-execution Needed",phone:"304-695-4391",email:"",address:"7649 Jones Run Rd",city:"Lumberport",state:"WV",zip:"26386",redline:"",lp_comments:"",comments:"4/29/2026 : Spoke with Thomas Lowe. Siblings cannot agree.||3/20/2026 : Mailed updated lease offer with DOP."},
  {lcid:"150219",name:"Colleen Bailey",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.01653,net:0.017,status:"Offer Mailed",phone:"",email:"",address:"3714 W Rockwell, Spokane WA",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/27/2026 : ADH needed. Drafting ADHs.||4/9/2026 : Mailed lease offer via UPS, tracking # 1ZR9Y9540296532017"},
  {lcid:"145040",name:"Crystal Michelle Terry Runyan",aka:"Crystal Mischelle Runyan",legal:"18-2611-2, 18-2611-11",tract:"664, 684, 683",gross:7.5,or_acres:null,net:3.5,status:"Offer Mailed",phone:"386-316-8746",email:"",address:"1445 Primrose Lane",city:"Daytona Beach",state:"FL",zip:"32117",redline:"",lp_comments:"",comments:"4/20/2026 : Delivered Monday April 06.||3/25/2026 : Mailed Lease Offer. UPS Tracking #1ZR9Y9540298547409"},
  {lcid:"150227",name:"Cynthia L. Parman",aka:"Heir of James Manley Morris",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0372,net:0.037,status:"Leased to 3rd party",phone:"",email:"",address:"15051 W SR 105, Elmore OH",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/28/2026 : Sold interest to Chad W. Johnson."},
  {lcid:"150230",name:"Dale Herbert Negus",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0558,net:0.056,status:"Executed Document Received",phone:"",email:"",address:"15062 S. E. 103rd Street",city:"Oclawaha",state:"FL",zip:"32179",redline:"",lp_comments:"",comments:"4/20/2026 : Found SEP lease in 2022. Sending retraction letter."},
  {lcid:"145043",name:"Daniel T. Cuic",aka:"",legal:"14-264-44",tract:"1216",gross:12.23,or_acres:null,net:1.13238,status:"Offer Mailed",phone:"814-476-6022",email:"",address:"",city:"",state:"",zip:"",redline:"",lp_comments:"Same as Dan Cuic. Send mailer",comments:"4/28/2026 : Contact info: 814-476-6022; 814-796-2028||3/23/2026 : Mailed Lease Offer to PO Box."},
  {lcid:"150237",name:"Daniel T. Cuic",aka:"Heir of Julia Elma Morris Furbee",legal:"18-242-21",tract:"229",gross:50,or_acres:0.2381,net:0.238,status:"Offer Mailed",phone:"814-476-6022",email:"",address:"",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"3/23/2026 : Mailed Lease Offer to PO Box."},
  {lcid:"150242",name:"Darrell R. Wirebaugh",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0372,net:0.037,status:"Transferred",phone:"",email:"",address:"1890 S Hopfinger Rd Oak Harbor OH",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"3/28/2026 : Delivered Wednesday March 25.||3/20/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540299884043"},
  {lcid:"150251",name:"David Layne Bond",aka:"Heir of Edward Gordon Bond, Ethel Bond",legal:"18-242-21",tract:"229",gross:50,or_acres:0.22322,net:0.223,status:"Executed Document Received",phone:"",email:"",address:"2248 Glenwood Rd.",city:"Vestal",state:"NY",zip:"13850",redline:"",lp_comments:"",comments:"4/28/2026 : Needs curatives. ADHs needed for Ethel M. Bond and Edward Gordon Bond.||3/20/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540299884043"},
  {lcid:"150253",name:"David Lee Robinson",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.07937,net:0.0795,status:"Offer Mailed",phone:"",email:"",address:"720 Rix Mills Road",city:"New Concord",state:"OH",zip:"43762",redline:"",lp_comments:"",comments:"4/28/2026 : Mailed lease to correct address. UPS Tracking 1ZR9Y9540295008685||3/21/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540290935763"},
  {lcid:"150265",name:"Dawneda Miller",aka:"Dawneda L. Gawthrop",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0062,net:0.0065,status:"Offer Mailed",phone:"(304) 360-2042",email:"",address:"2 Doe Circle",city:"Culloden",state:"WV",zip:"25510",redline:"",lp_comments:"",comments:"4/28/2026 : Contact info: (304) 360-2042||3/27/2026 : Mailed Lease Offer via UPS. Track # 1ZR9Y9540293530631"},
  {lcid:"150425",name:"Deborah Campbell Spencer",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.29762,net:0.2975,status:"Offer Mailed",phone:"859-339-3006",email:"",address:"",city:"Lexington",state:"KY",zip:"",redline:"",lp_comments:"",comments:"3/31/2026 : Mailed Lease Offer via UPS. Tracking # 1ZR9Y9540292342837"},
  {lcid:"150438",name:"Diane K. Jones",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0558,net:0.056,status:"Offer Mailed",phone:"304-677-8126",email:"",address:"71 Brentwood Dr.",city:"Bridgeport",state:"WV",zip:"26330",redline:"",lp_comments:"",comments:"4/23/2026 : Contact info: 304-677-8126||3/21/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540294417404"},
  {lcid:"150442",name:"Donald Robinson",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.02646,net:0.0265,status:"Offer Mailed",phone:"(317) 738-0493",email:"",address:"8267 Pisgah Ridge Rd.",city:"McConnelsville",state:"OH",zip:"43756",redline:"",lp_comments:"",comments:"4/28/2026 : Contact info: (317) 738-0493||3/27/2026 : Mailed Lease Offer via UPS. Tracking # 1ZR9Y9540291052625"},
  {lcid:"150449",name:"Daniel R. Furbee (dower Martha G. Furbee)",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.714286,net:0.35725,status:"Offer Mailed",phone:"",email:"",address:"562 Call Road",city:"Crown City",state:"OH",zip:"45623",redline:"",lp_comments:"",comments:"4/9/2026 : Mailed Lease offer via UPS, Tracking # 1ZR9Y9540297900046"},
  {lcid:"150462",name:"Edward Blair Jr. Nuzum",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0496,net:0.0495,status:"Offer Mailed",phone:"(828) 855-5550",email:"",address:"400 5th Street NE",city:"Conover",state:"NC",zip:"28613",redline:"",lp_comments:"",comments:"4/28/2026 : Contact info: (828) 855-5550||3/27/2026 : Mailed Lease Offer via UPS. Tracking # 1ZR9Y9540293812185"},
  {lcid:"150479",name:"Edward Paul Jr. Bailey",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.04216,net:0.042,status:"Offer Mailed",phone:"(865) 233-2880",email:"",address:"204 Wilson Circle",city:"Arapahoe",state:"NC",zip:"28510",redline:"",lp_comments:"",comments:"4/28/2026 : Contact info: (865) 233-2880||3/31/2026 : Mailed lease offer via UPS. Tracking # 1ZR9Y9540290602961"},
  {lcid:"150489",name:"Elizabeth 'Betty' Ann Smith",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.11161,net:0.1115,status:"Deceased",phone:"",email:"",address:"2983 McCutchenville Rd.",city:"Fostoria",state:"OH",zip:"44830",redline:"",lp_comments:"Heirs: Steven L. Smith HEIR, David L. Smith HEIR, Vicki D. Marshall HEIR",comments:"4/21/2026 : Updating status to Deceased.||3/10/2026 : Deceased DOD December 23 2015."},
  {lcid:"145116",name:"Elizabeth Linville Trust",aka:"",legal:"14-244-34, 14-244-35, 14-244-36",tract:"513",gross:47.06,or_acres:null,net:3.4335,status:"Offer Mailed",phone:"(757) 482-4653",email:"",address:"",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/28/2026 : Attempted contact (757) 482-4653. No answer.||4/9/2026 : Mailed lease offer via UPS, tracking # 1ZR9Y9540293579125"},
  {lcid:"150492",name:"Elizabeth Summers",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.14881,net:0.149,status:"Offer Mailed",phone:"(864) 582-1101",email:"",address:"406 Dorchester Court, Chesapeake VA",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"3/27/2026 : Mailed Lease Offer via UPS. Tracking # 1ZR9Y9540297360960"},
  {lcid:"150493",name:"Ellen Wetmore",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0496,net:0.0495,status:"Offer Mailed",phone:"(864) 582-1101",email:"",address:"486 E. Lake Drive",city:"Spartanburg",state:"SC",zip:"29302",redline:"",lp_comments:"",comments:"3/27/2026 : Mailed Lease Offer via UPS. Tracking # 1ZR9Y9540297360960"},
  {lcid:"150512",name:"Frances Nuzum",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.19841,net:0.099,status:"Deceased",phone:"",email:"",address:"11651 Padina Drive Fort Meyers FL",city:"",state:"",zip:"",redline:"",lp_comments:"Heirs: Penelope Penny Brannon HEIR, Patrick Nuzum HEIR, Paul Nuzum HEIR",comments:"4/28/2026 : DECEASED 2021. Survivors: Penny Kay Brannon, Patrick Nuzum, Paul Nuzum.||4/9/2026 : Mailed lease offer via UPS, tracking # 1ZR9Y9540291935949"},
  {lcid:"150514",name:"Francess Petree",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.19841,net:0.1985,status:"Leased to 3rd party",phone:"",email:"",address:"",city:"",state:"",zip:"",redline:"",lp_comments:"Not leasable",comments:"4/21/2026 : Leased to 3rd Party. SEP lease DB 1756/929."},
  {lcid:"150517",name:"Frederica Smith",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.14881,net:0.149,status:"Offer Mailed",phone:"(706) 447-1587",email:"",address:"615 Butler Springs Circle, Grovetown GA",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/28/2026 : Attempted contact (706) 447-1587. No answer.||4/9/2026 : Mailed lease offer via UPS, tracking # 1ZR9Y9540291753172"},
  {lcid:"149485",name:"Gary Joel Trout",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.59524,net:0.595,status:"Executed Document Received",phone:"646-283-1738",email:"",address:"55 West 14th St., Apt 5-C",city:"New York",state:"NY",zip:"10011",redline:"",lp_comments:"",comments:"4/18/2026 : Executed documents received.||3/31/2026 : Mailed to current address. UPS tracking # 1ZR9Y9540297583934||3/20/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540297483846"},
  {lcid:"150573",name:"Gwen Anne Hickman Leibel",aka:"Heir of Ralph E. Hickman Sr., Viola Mae Nuzum",legal:"18-242-21",tract:"229",gross:50,or_acres:0.06611,net:0.066,status:"Executed Document Received",phone:"",email:"",address:"45 Fairmont Rd.",city:"Goldens Bridge",state:"NY",zip:"10526",redline:"",lp_comments:"",comments:"4/28/2026 : Needs curatives. ADH needed for Agatha Mae Nuzum Hickman.||3/21/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540297494754"},
  {lcid:"150590",name:"Heather Lee Alderson Lindberg",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.44643,net:0.4465,status:"Offer Mailed",phone:"(951) 845-0998",email:"",address:"14077 County Rd #5",city:"Longmont",state:"CO",zip:"80504",redline:"",lp_comments:"",comments:"3/20/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540290118968"},
  {lcid:"150593",name:"Helen E. Closson",aka:"Heir of James Manley Morris",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0372,net:0.037,status:"Offer Mailed",phone:"706-447-1587",email:"",address:"13490 Highway 8 Business 22",city:"Lakeside",state:"CA",zip:"92040",redline:"",lp_comments:"",comments:"3/21/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540294844649"},
  {lcid:"150614",name:"Jack B. Bailey",aka:"Heir of Roy Guyle Bailey",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0248,net:0.025,status:"Offer Mailed",phone:"(253) 692-6979",email:"",address:"P.O. Box 31",city:"Keyport",state:"WA",zip:"98345",redline:"",lp_comments:"",comments:"3/27/2026 : Mailed Lease Offer via USPS."},
  {lcid:"150628",name:"James Edward Duncan",aka:"",legal:"18-242-21, 18-242-20",tract:"229, 3052",gross:124,or_acres:0.38839,net:0.38818,status:"New Upload",phone:"",email:"",address:"336 Rapid Run Road",city:"Camden",state:"SC",zip:"29020",redline:"",lp_comments:"",comments:"4/28/2026 : UNLEASABLE. Mineral interest sold to AllDale Minerals in 2015."},
  {lcid:"150630",name:"James Hamilton",aka:"Heir of James Manley Morris",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0372,net:0.037,status:"Offer Mailed",phone:"",email:"",address:"791 Sandalwood Road, West Perrysburg OH",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/27/2026 : ADH needed for Eunice B. Smith Hamilton.||4/9/2026 : Mailed lease offer via UPS, tracking # 1ZR9Y9540291405995"},
  {lcid:"150645",name:"James T. Farrell",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.19841,net:0.1985,status:"Offer Mailed",phone:"(910) 425-0177",email:"",address:"5221 Butternut Drive",city:"Fayetteville",state:"NC",zip:"28304",redline:"",lp_comments:"",comments:"3/21/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540297134651"},
  {lcid:"150649",name:"Jan Etta Greenfelder",aka:"Jan Etta Greenfielder",legal:"18-242-21",tract:"229",gross:50,or_acres:0.22321,net:0.223,status:"Executed Document Received",phone:"",email:"",address:"935 Duck Hollow Cir NE",city:"North Canton",state:"OH",zip:"44720",redline:"",lp_comments:"",comments:"4/29/2026 : LWTs for Roy G. Smith and Eunice Victoria Morris Smith available.||4/1/2026 : Mailed Lease Offer via UPS: Tracking # 1ZR9Y9540293072716"},
  {lcid:"150650",name:"Janet L. Savage",aka:"Heir of Eileen June Bailey",legal:"18-242-21",tract:"229",gross:50,or_acres:null,net:0.0165,status:"Offer Mailed",phone:"(850) 736-2561",email:"",address:"16850 Buffalo Valley Path, Monument CO",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/9/2026 : Mailed lease offer via UPS, tracking # 1ZR9Y9540292601217"},
  {lcid:"150651",name:"Janet O'Brien",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.14881,net:0.149,status:"Offer Mailed",phone:"(303) 956-3863",email:"",address:"12004 S. Allerton Circle, Parker CO",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/9/2026 : Mailed lease offer via UPS, tracking # 1ZR9Y9540293706835"},
  {lcid:"150652",name:"Janet Robinson",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.02646,net:0.0265,status:"Offer Mailed",phone:"(304) 758-4838",email:"",address:"RR 2 Box #234",city:"New Martinsville",state:"WV",zip:"26155",redline:"",lp_comments:"",comments:"3/27/2026 : Mailed Lease Offer via UPS. Tracking # 1ZR9Y9540297057137"},
  {lcid:"150671",name:"Joan Hickman Gonzales",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.02205,net:0.022,status:"Offer Mailed",phone:"",email:"",address:"2153 Belgrade Swansboro Rd",city:"Maysville",state:"NC",zip:"28555",redline:"",lp_comments:"",comments:"4/28/2026 : Mailed to POA address. UPS Tracking #1ZR9Y9540295999301||3/27/2026 : Mailed Lease Offer via UPS. Tracking # 1ZR9Y9540297481179"},
  {lcid:"150677",name:"John Carr Bailey",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.00744,net:0.0075,status:"Re-execution Needed",phone:"",email:"",address:"100 Quail Roost Dr.",city:"Carrboro",state:"NC",zip:"27510",redline:"",lp_comments:"",comments:"4/28/2026 : Needs curatives: Nellie Opal Norman Bailey LWT, Viola Mae Nuzum ADH.||3/27/2026 : Mailed Lease Offer via UPS. Tracking # 1ZR9Y9540296803411"},
  {lcid:"150694",name:"John R. Smith",aka:"",legal:"18-242-20, 18-242-21",tract:"3052, 229",gross:124,or_acres:0.55357,net:0.55336,status:"Executed Document Received",phone:"",email:"",address:"109 Rose Ave.",city:"Clarksburg",state:"WV",zip:"26301",redline:"",lp_comments:"",comments:"4/16/2026 : John called, A&R being notarized.||4/3/2026 : Mailed lease offer via UPS: Tracking # 1ZR9Y9540298899440"},
  {lcid:"150706",name:"Juanita Blankenship",aka:"Heir of Wilma Bailey Coffman",legal:"18-242-20, 18-242-21",tract:"3052, 229",gross:124,or_acres:0.036,net:0.0366,status:"Offer Mailed",phone:"804-873-1360",email:"",address:"228 Roxalana Hill Rd.",city:"Dunbar",state:"WV",zip:"25064",redline:"",lp_comments:"",comments:"4/28/2026 : Received executed documents 4/27/2026.||4/1/2026 : Mailed lease offer via UPS. Tracking # 1ZR9Y9540295846878"},
  {lcid:"150711",name:"Judy Carney",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.19841,net:0.1985,status:"Offer Mailed",phone:"(317) 786-4307",email:"",address:"1748 E. Maynard Drive, Indianapolis IN",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/9/2026 : Mailed lease offer via UPS, tracking # 1ZR9Y9540291850852"},
  {lcid:"150719",name:"Julie N. Forrester",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0496,net:0.0495,status:"Offer Mailed",phone:"(864) 423-8692",email:"",address:"105 Pope Field Rd.",city:"Easley",state:"SC",zip:"29642",redline:"",lp_comments:"",comments:"3/27/2026 : Mailed Lease Offer via UPS. Tracking # 1ZR9Y9540294640618"},
  {lcid:"150721",name:"Karen Furbee Borg",aka:"",legal:"18-242-21",tract:"229",gross:50,or_acres:null,net:0.35725,status:"Offer Mailed",phone:"(602) 725-9918",email:"",address:"356 Harbor Dr #26A",city:"Morgantown",state:"WV",zip:"26508",redline:"",lp_comments:"",comments:"3/20/2026 : Mailed lease offer. UPS Tracking #1ZR9Y9540296275920"},
  {lcid:"150722",name:"Karen S. O'Brien",aka:"Heir of James Manley Morris",legal:"18-242-21",tract:"229",gross:50,or_acres:0.0372,net:0.037,status:"Leased to 3rd party",phone:"",email:"",address:"",city:"",state:"",zip:"",redline:"",lp_comments:"",comments:"4/28/2026 : Sold interest to Chad W. Johnson."},
];

function parseComments(raw) {
  if (!raw) return { log: [], ups: [], cur: [] };
  const entries = raw.split("||").map(s => s.trim()).filter(Boolean);
  const log = [], ups = [], cur = [], seen = new Set();
  const upsRx = /\b(1Z[A-Z0-9]{14,})\b/gi;
  const dateRx = /^(\d{1,2}\/\d{1,2}\/\d{4})\s*:/;
  const curKw = /\b(deceased|heir|heirship|adh|lwt|probate|curative|vesting deed|affidavit|unleasable)\b/i;
  entries.forEach(entry => {
    const dm = entry.match(dateRx);
    const date = dm ? dm[1] : "";
    const text = dm ? entry.slice(dm[0].length).trim() : entry;
    const tracks = [...text.matchAll(upsRx)].map(m => m[1]);
    tracks.forEach(t => {
      if (seen.has(t)) return; seen.add(t);
      let status = "Sent";
      if (/delivered/i.test(text)) status = "Delivered";
      else if (/rts|return(ed)? to sender|unable to obtain/i.test(text)) status = "RTS";
      ups.push({ tracking: t, date, notes: text.replace(upsRx, "").trim().slice(0, 90), status });
    });
    if (curKw.test(text)) {
      const priority = /deceased|heir|probate|adh|lwt|unleasable/i.test(text) ? "high" : "medium";
      cur.push({ date, issue: text.slice(0, 220), priority });
    }
    let tag = "note";
    if (/mailed|ups|tracking|delivered|rts/i.test(text) && tracks.length) tag = "ups";
    else if (curKw.test(text)) tag = "curative";
    else if (/adverse|adversing|open to lease/i.test(text)) tag = "adverse";
    else if (/phone|called|spoke|email|contact|voicemail/i.test(text)) tag = "contact";
    else if (/negotiat|counter|bonus|royalt/i.test(text)) tag = "negotiation";
    else if (/approved|executed|received|signed/i.test(text)) tag = "executed";
    log.push({ date, text, tag });
  });
  return { log, ups, cur };
}

const STATUS_STYLES = {
  "Executed Document Received": { bg: "#d1fae5", co: "#065f46" },
  "Offer Mailed": { bg: TL, co: TD },
  "RTS": { bg: "#fef3c7", co: "#92400e" },
  "Deceased": { bg: "#fee2e2", co: "#991b1b" },
  "Leased to 3rd party": { bg: "#f3f4f6", co: "#374151" },
  "Re-execution Needed": { bg: "#ede9fe", co: "#5b21b6" },
  "Transferred": { bg: "#f3f4f6", co: "#374151" },
  "Drop/HBP": { bg: "#f3f4f6", co: "#374151" },
  "Committed to Lease": { bg: "#d1fae5", co: "#065f46" },
  "New Upload": { bg: "#f3f4f6", co: "#374151" },
};

const TAG_STYLES = {
  ups: { bg: "#dbeafe", co: "#1e40af" },
  curative: { bg: "#fee2e2", co: "#991b1b" },
  contact: { bg: "#d1fae5", co: "#065f46" },
  adverse: { bg: "#f3f4f6", co: "#374151" },
  email: { bg: "#ede9fe", co: "#5b21b6" },
  executed: { bg: "#d1fae5", co: "#065f46" },
  negotiation: { bg: "#fef3c7", co: "#92400e" },
  note: { bg: "#f3f4f6", co: "#374151" },
};

const ALL_STATUSES = ["Offer Mailed","Executed Document Received","RTS","Deceased","Leased to 3rd party","Re-execution Needed","Transferred","Drop/HBP","Committed to Lease","New Upload"];
function ss(s) { return STATUS_STYLES[s] || { bg: "#f3f4f6", co: "#374151" }; }

function StatusBadge({ status, sm }) {
  const c = ss(status);
  return <span style={{ background: c.bg, color: c.co, display: "inline-block", padding: sm ? "1px 6px" : "2px 8px", borderRadius: 20, fontSize: sm ? 9 : 10, fontWeight: 500, whiteSpace: "nowrap" }}>{status}</span>;
}

function TagPill({ tag }) {
  const c = TAG_STYLES[tag] || TAG_STYLES.note;
  return <span style={{ background: c.bg, color: c.co, padding: "1px 5px", borderRadius: 20, fontSize: 9, fontWeight: 600, marginRight: 4, verticalAlign: 1, display: "inline-block" }}>{tag}</span>;
}

function Stat({ label, value, sub, valueColor }) {
  return (
    <div style={{ background: "#f5f5f7", borderRadius: 10, padding: "11px 13px" }}>
      <div style={{ fontSize: 10, color: "#8e8e93", fontWeight: 500, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 700, color: valueColor || "#1d1d1f", letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#aeaeb2", marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style }) {
  return <div style={{ background: "#f5f5f7", borderRadius: 10, padding: "13px 15px", marginBottom: 10, ...style }}>{children}</div>;
}

function FieldRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "0.5px solid #ebebeb", fontSize: 11 }}>
      <span style={{ color: "#8e8e93", flex: "0 0 130px", fontWeight: 500 }}>{label}</span>
      <span style={{ color: "#1d1d1f", textAlign: "right", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</span>
    </div>
  );
}

function Btn({ onClick, primary, danger, sm, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: sm ? "5px 11px" : "7px 14px", fontSize: sm ? 11 : 12, border: danger ? "0.5px solid #fca5a5" : primary ? "none" : "0.5px solid #e5e5ea", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", background: primary ? T : danger ? "#fee2e2" : "#fff", color: primary ? "#fff" : danger ? "#991b1b" : "#1d1d1f", fontWeight: primary ? 600 : 400, opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap", fontFamily: "inherit" }}>
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, mono }) {
  return <input value={value} onChange={onChange} placeholder={placeholder} style={{ padding: "7px 10px", fontSize: 11, border: "0.5px solid #e5e5ea", borderRadius: 7, background: "#f9f9f9", color: "#1d1d1f", width: "100%", fontFamily: mono ? "monospace" : "inherit" }} />;
}

function Select({ value, onChange, options, style }) {
  return (
    <select value={value} onChange={onChange} style={{ padding: "7px 10px", fontSize: 11, border: "0.5px solid #e5e5ea", borderRadius: 7, background: "#f9f9f9", color: "#1d1d1f", fontFamily: "inherit", ...style }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function NavItem({ icon, label, indent, active, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 7, padding: `7px 14px 7px ${indent ? "24px" : "14px"}`, cursor: "pointer", fontSize: 12, borderRadius: 8, margin: "1px 6px", color: active ? "#fff" : "#8e8e93", background: active ? T : "transparent", fontWeight: active ? 600 : 400 }}>
      <i className={`ti ${icon}`} style={{ fontSize: indent ? 13 : 14 }} aria-hidden="true" />{label}
    </div>
  );
}

function TRow({ onClick, children }) {
  const [h, setH] = useState(false);
  return <tr onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ borderBottom: "0.5px solid #f5f5f7", cursor: "pointer", background: h ? TL : "transparent" }}>{children}</tr>;
}

function TD2({ children, style }) {
  return <td style={{ padding: "9px 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...style }}>{children}</td>;
}

function THead({ cols }) {
  return (
    <thead style={{ position: "sticky", top: 0, background: "#f9f9fb", zIndex: 1 }}>
      <tr>{cols.map(([h, w]) => <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontWeight: 600, fontSize: 10, color: "#8e8e93", letterSpacing: "0.4px", textTransform: "uppercase", borderBottom: "0.5px solid #e5e5ea", width: w, whiteSpace: "nowrap" }}>{h}</th>)}</tr>
    </thead>
  );
}

function ContactModal({ existing, onSave, onClose }) {
  const blank = { lcid: "", name: "", aka: "", legal: "", tract: "", gross: "", or_acres: "", net: "", status: "Offer Mailed", phone: "", email: "", address: "", city: "", state: "", zip: "", redline: "", lp_comments: "" };
  const [form, setForm] = useState(existing ? { ...existing } : blank);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSave = async () => {
    if (!form.name.trim()) return alert("Owner name is required.");
    setSaving(true);
    await onSave({ ...form, gross: parseFloat(form.gross) || 0, or_acres: parseFloat(form.or_acres) || null, net: parseFloat(form.net) || 0, contact_confirmed: !!(form.phone || form.email), log: existing?.log || [], ups_shipments: existing?.ups_shipments || [], curative_items: existing?.curative_items || [] });
    setSaving(false); onClose();
  };
  const F = (label, key, opts = {}) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, color: "#8e8e93", marginBottom: 3, fontWeight: 500 }}>{label}</div>
      {opts.select ? <Select value={form[key] || ""} onChange={e => set(key, e.target.value)} options={opts.select} style={{ width: "100%" }} />
        : <Input value={form[key] || ""} onChange={e => set(key, e.target.value)} placeholder={opts.placeholder || ""} mono={opts.mono} />}
    </div>
  );
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#fff", borderRadius: 14, width: 560, maxHeight: "88vh", overflowY: "auto", padding: 22, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{existing ? "Edit contact" : "Add new contact"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#8e8e93" }}>×</button>
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#8e8e93", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Identification</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{F("LCID", "lcid")}{F("Status", "status", { select: ALL_STATUSES })}</div>
        {F("Owner name", "name", { placeholder: "Full legal name" })}{F("AKA / Heirs of", "aka")}
        <div style={{ fontSize: 10, fontWeight: 600, color: "#8e8e93", margin: "12px 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Property</div>
        {F("Legal description", "legal")}{F("Tract ID", "tract")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>{F("Gross acres", "gross")}{F("OR acres", "or_acres")}{F("Net acres", "net")}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#8e8e93", margin: "12px 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Contact info</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{F("Phone", "phone")}{F("Email", "email")}</div>
        {F("Address", "address")}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>{F("City", "city")}{F("State", "state")}{F("ZIP", "zip")}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#8e8e93", margin: "12px 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Notes</div>
        {F("Redline", "redline")}{F("LP comments", "lp_comments")}
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary onClick={handleSave} disabled={saving}><i className="ti ti-check" style={{ fontSize: 11 }} /> {saving ? "Saving…" : "Save contact"}</Btn>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ name, onConfirm, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, width: 360, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Delete contact?</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 20 }}>This will permanently delete <strong>{name}</strong> and all their data. Cannot be undone.</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn danger onClick={onConfirm}><i className="ti ti-trash" style={{ fontSize: 11 }} /> Delete permanently</Btn>
        </div>
      </div>
    </div>
  );
}

function ContactDetail({ contact: c, onBack, onUpdate, onDelete }) {
  const [tab, setTab] = useState("overview");
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [newLog, setNewLog] = useState("");
  const [newUPS, setNewUPS] = useState({ tracking: "", notes: "", date: "", status: "Sent" });
  const [newCur, setNewCur] = useState({ issue: "", priority: "medium" });
  const [saving, setSaving] = useState(false);
  const inits = c.name.split(" ").filter(w => /^[A-Z]/i.test(w)).slice(0, 2).map(w => w[0].toUpperCase()).join("");
  const today = () => { const t = new Date(); return `${t.getMonth() + 1}/${t.getDate()}/${t.getFullYear()}`; };
  const persist = async (updates) => {
    setSaving(true);
    const { error } = await supabase.from("contacts").update(updates).eq("id", c.id);
    if (!error) onUpdate({ ...c, ...updates });
    setSaving(false);
  };
  const addLog = async () => { if (!newLog.trim()) return; await persist({ log: [{ date: today(), text: newLog.trim(), tag: "note" }, ...(c.log || [])] }); setNewLog(""); };
  const addCur = async () => { if (!newCur.issue.trim()) return; await persist({ curative_items: [{ date: today(), issue: newCur.issue.trim(), priority: newCur.priority }, ...(c.curative_items || [])] }); setNewCur({ issue: "", priority: "medium" }); };
  const addUPS = async () => { if (!newUPS.tracking.trim()) return; await persist({ ups_shipments: [{ ...newUPS }, ...(c.ups_shipments || [])] }); setNewUPS({ tracking: "", notes: "", date: "", status: "Sent" }); };
  const tabs = [{ id: "overview", label: "Overview" }, { id: "log", label: `Activity (${(c.log || []).length})` }, { id: "ci", label: "Contact info" }, { id: "cur", label: `Curative (${(c.curative_items || []).length})` }, { id: "ups", label: `UPS (${(c.ups_shipments || []).length})` }];
  return (
    <>
      {showEdit && <ContactModal existing={c} onSave={async p => await persist(p)} onClose={() => setShowEdit(false)} />}
      {showDelete && <DeleteConfirm name={c.name} onConfirm={async () => { await supabase.from("contacts").delete().eq("id", c.id); onDelete(c.id); }} onClose={() => setShowDelete(false)} />}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 20px", borderBottom: "0.5px solid #e5e5ea", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T, fontWeight: 600, padding: 0, fontFamily: "inherit" }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 13 }} /> Back
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
            <StatusBadge status={c.status} />
          </div>
          <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
            <Btn sm onClick={() => setShowEdit(true)}><i className="ti ti-edit" style={{ fontSize: 11 }} /> Edit</Btn>
            <Btn sm danger onClick={() => setShowDelete(true)}><i className="ti ti-trash" style={{ fontSize: 11 }} /> Delete</Btn>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", borderBottom: "0.5px solid #f2f2f7", flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: TL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: TD, flexShrink: 0 }}>{inits || "?"}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: 10, color: "#8e8e93", marginTop: 2 }}>LCID {c.lcid} · Tract {c.tract} · {c.legal}{c.aka ? ` · ${c.aka}` : ""}</div>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "0.5px solid #e5e5ea", flexShrink: 0, padding: "0 20px", overflowX: "auto" }}>
          {tabs.map(t => <div key={t.id} onClick={() => setTab(t.id)} style={{ padding: "9px 12px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", color: tab === t.id ? T : "#8e8e93", fontWeight: tab === t.id ? 600 : 400, borderBottom: `2px solid ${tab === t.id ? T : "transparent"}`, marginBottom: -0.5 }}>{t.label}</div>)}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          {tab === "overview" && (
            <>
              <Card>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 9 }}>Lease record</div>
                <FieldRow label="LCID" value={c.lcid} />
                <FieldRow label="Legal description" value={c.legal} />
                <FieldRow label="Tract ID" value={c.tract} />
                {c.aka && <FieldRow label="AKA / Heirs of" value={c.aka} />}
                <FieldRow label="Gross acres" value={c.gross ? parseFloat(c.gross).toFixed(4) : null} />
                <FieldRow label="OR acres" value={c.or_acres != null ? parseFloat(c.or_acres).toFixed(5) : null} />
                <FieldRow label="Net acres" value={c.net ? parseFloat(c.net).toFixed(4) : null} />
                <FieldRow label="Status" value={<StatusBadge status={c.status} />} />
                {c.redline && <FieldRow label="Redline" value={c.redline} />}
                {c.lp_comments && <FieldRow label="LP notes" value={c.lp_comments} />}
              </Card>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                <Stat label="Activity entries" value={(c.log || []).length} />
                <Stat label="UPS shipments" value={(c.ups_shipments || []).length} />
                <Stat label="Curative items" value={(c.curative_items || []).length} valueColor={(c.curative_items || []).length ? "#dc2626" : undefined} />
              </div>
            </>
          )}
          {tab === "log" && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <textarea value={newLog} onChange={e => setNewLog(e.target.value)} placeholder="Add activity note…" rows={2} style={{ flex: 1, padding: "7px 10px", fontSize: 11, border: "0.5px solid #e5e5ea", borderRadius: 8, resize: "vertical", background: "#f9f9f9", fontFamily: "inherit" }} />
                <Btn primary onClick={addLog} disabled={saving}><i className="ti ti-plus" style={{ fontSize: 11 }} /> Add</Btn>
              </div>
              {(c.log || []).length ? (c.log || []).map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "0.5px solid #f5f5f7", fontSize: 11 }}>
                  <div style={{ color: "#aeaeb2", flexShrink: 0, width: 70, fontSize: 10, paddingTop: 1 }}>{l.date}</div>
                  <div style={{ flex: 1, lineHeight: 1.5 }}><TagPill tag={l.tag} />{l.text}</div>
                </div>
              )) : <div style={{ fontSize: 11, color: "#aeaeb2" }}>No activity logged.</div>}
            </>
          )}
          {tab === "ci" && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600 }}>Contact details</div>
                <span style={{ background: c.contact_confirmed ? "#d1fae5" : "#fee2e2", color: c.contact_confirmed ? "#065f46" : "#991b1b", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 500 }}>{c.contact_confirmed ? "Confirmed" : "Unconfirmed"}</span>
              </div>
              <FieldRow label="Phone" value={c.phone} />
              <FieldRow label="Email" value={c.email} />
              <FieldRow label="Address" value={c.address} />
              <FieldRow label="City / State / ZIP" value={[c.city, c.state, c.zip].filter(Boolean).join(", ")} />
              <div style={{ marginTop: 10 }}><Btn sm onClick={() => setShowEdit(true)}><i className="ti ti-edit" style={{ fontSize: 11 }} /> Edit contact info</Btn></div>
            </Card>
          )}
          {tab === "cur" && (
            <>
              <Card style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Add curative item</div>
                <textarea value={newCur.issue} onChange={e => setNewCur({ ...newCur, issue: e.target.value })} placeholder="Describe the curative issue…" rows={2} style={{ width: "100%", padding: "7px 10px", fontSize: 11, border: "0.5px solid #e5e5ea", borderRadius: 7, resize: "vertical", background: "#fff", marginBottom: 6, fontFamily: "inherit" }} />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Select value={newCur.priority} onChange={e => setNewCur({ ...newCur, priority: e.target.value })} options={["high", "medium", "low"]} style={{ width: "auto" }} />
                  <Btn primary sm onClick={addCur} disabled={saving}><i className="ti ti-plus" style={{ fontSize: 11 }} /> Add</Btn>
                </div>
              </Card>
              {(c.curative_items || []).length ? (c.curative_items || []).map((cur, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${cur.priority === "high" ? "#ef4444" : cur.priority === "medium" ? "#f59e0b" : "#9ca3af"}`, borderRadius: "0 8px 8px 0", background: cur.priority === "high" ? "#fef9f9" : cur.priority === "medium" ? "#fffbeb" : "#f9fafb", padding: "8px 10px", marginBottom: 6, fontSize: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ background: cur.priority === "high" ? "#fee2e2" : "#fef3c7", color: cur.priority === "high" ? "#991b1b" : "#92400e", padding: "1px 6px", borderRadius: 20, fontSize: 9, fontWeight: 600 }}>{cur.priority}</span>
                    {cur.date && <span style={{ fontSize: 10, color: "#aeaeb2" }}>{cur.date}</span>}
                  </div>
                  <div style={{ color: "#636366", lineHeight: 1.5 }}>{cur.issue}</div>
                </div>
              )) : <div style={{ fontSize: 11, color: "#aeaeb2" }}>No curative items.</div>}
            </>
          )}
          {tab === "ups" && (
            <>
              <Card style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Log shipment</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                  <input placeholder="Tracking # (1Z…)" value={newUPS.tracking} onChange={e => setNewUPS({ ...newUPS, tracking: e.target.value })} style={{ padding: "7px 9px", fontSize: 11, border: "0.5px solid #e5e5ea", borderRadius: 7, fontFamily: "monospace", background: "#fff" }} />
                  <input placeholder="Date" value={newUPS.date} onChange={e => setNewUPS({ ...newUPS, date: e.target.value })} style={{ padding: "7px 9px", fontSize: 11, border: "0.5px solid #e5e5ea", borderRadius: 7, fontFamily: "inherit", background: "#fff" }} />
                  <input placeholder="Notes" value={newUPS.notes} onChange={e => setNewUPS({ ...newUPS, notes: e.target.value })} style={{ padding: "7px 9px", fontSize: 11, border: "0.5px solid #e5e5ea", borderRadius: 7, fontFamily: "inherit", background: "#fff" }} />
                  <Select value={newUPS.status} onChange={e => setNewUPS({ ...newUPS, status: e.target.value })} options={["Sent", "In transit", "Delivered", "RTS"]} style={{ width: "100%" }} />
                </div>
                <Btn primary sm onClick={addUPS} disabled={saving}><i className="ti ti-plus" style={{ fontSize: 11 }} /> Log shipment</Btn>
              </Card>
              {(c.ups_shipments || []).length ? (c.ups_shipments || []).map((u, i) => (
                <div key={i} style={{ background: TL, borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: T, marginBottom: 3 }}>{u.tracking}</div>
                  <div style={{ fontSize: 10, color: "#6b7280", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span>{u.notes}</span>{u.date && <span>{u.date}</span>}
                    <span style={{ background: u.status === "Delivered" ? "#d1fae5" : u.status === "RTS" ? "#fee2e2" : "#fef3c7", color: u.status === "Delivered" ? "#065f46" : u.status === "RTS" ? "#991b1b" : "#92400e", padding: "1px 6px", borderRadius: 20, fontSize: 9, fontWeight: 600 }}>{u.status}</span>
                  </div>
                </div>
              )) : <div style={{ fontSize: 11, color: "#aeaeb2" }}>No shipments logged.</div>}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [view, setView] = useState("dashboard");
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("contacts").select("*").order("name");
      if (!error && data) {
        if (data.length === 0) {
          setSeeding(true);
          const payload = SEED.map(r => {
            const { log, ups, cur } = parseComments(r.comments || "");
            return { lcid: r.lcid, name: r.name, aka: r.aka || "", legal: r.legal || "", tract: r.tract || "", gross: r.gross || 0, or_acres: r.or_acres || null, net: r.net || 0, status: r.status, phone: r.phone || "", email: r.email || "", address: r.address || "", city: r.city || "", state: r.state || "", zip: r.zip || "", redline: r.redline || "", lp_comments: r.lp_comments || "", contact_confirmed: !!(r.phone || r.email), log, ups_shipments: ups, curative_items: cur };
          });
          const { data: seeded } = await supabase.from("contacts").insert(payload).select();
          if (seeded) setContacts(seeded.sort((a, b) => a.name.localeCompare(b.name)));
          setSeeding(false);
        } else {
          setContacts(data);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleAdd = async (payload) => {
    const { data } = await supabase.from("contacts").insert([payload]).select();
    if (data) setContacts(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleUpdate = useCallback((updated) => {
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSel(updated);
  }, []);

  const handleDelete = useCallback((id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setSel(null); setView("cru");
  }, []);

  const filtered = useMemo(() => contacts.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.name?.toLowerCase().includes(q) || c.lcid?.includes(q) || c.legal?.toLowerCase().includes(q) || c.tract?.includes(q)) && (statusF === "All" || c.status === statusF);
  }), [contacts, search, statusF]);

  const allStatuses = useMemo(() => ["All", ...Array.from(new Set(contacts.map(c => c.status))).sort()], [contacts]);
  const stats = useMemo(() => {
    const sc = {}; let cu = 0, up = 0, cc = 0;
    contacts.forEach(c => { sc[c.status] = (sc[c.status] || 0) + 1; cu += (c.curative_items || []).length; up += (c.ups_shipments || []).length; if (c.contact_confirmed) cc++; });
    return { sc, cu, up, cc };
  }, [contacts]);

  if (loading || seeding) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: 13, color: "#8e8e93", fontFamily: "-apple-system,sans-serif", flexDirection: "column", gap: 8 }}>
      <i className="ti ti-loader" style={{ fontSize: 28, color: T }} />
      <div>{seeding ? "Loading 63 TLC contacts…" : "Loading DMC…"}</div>
    </div>
  );

  const Hdr = ({ title, chip, action }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: "0.5px solid #e5e5ea", flexShrink: 0, background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.3px" }}>{title}</span>
        {chip && <span style={{ background: TL, color: TD, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500, border: `0.5px solid ${T}`, marginLeft: 8 }}>{chip}</span>}
      </div>
      {action}
    </div>
  );

  const font = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif";

  return (
    <>
      {showAdd && <ContactModal onSave={handleAdd} onClose={() => setShowAdd(false)} />}
      <div style={{ display: "flex", height: "100vh", fontFamily: font, background: "#fff" }}>
        <div style={{ width: 220, background: "#1d1d1f", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #2d2d2f" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#f5f5f7", letterSpacing: "-0.4px" }}><i className="ti ti-map-2" style={{ fontSize: 14, verticalAlign: -1, marginRight: 6, color: T }} aria-hidden="true" />DMC</div>
            <div style={{ fontSize: 10, color: "#636366", marginTop: 2 }}>Landman management</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
            <NavItem icon="ti-layout-dashboard" label="Dashboard" active={view === "dashboard" && !sel} onClick={() => { setView("dashboard"); setSel(null); }} />
            <div style={{ height: 6 }} />
            <div style={{ fontSize: 10, fontWeight: 500, color: "#3a3a3c", padding: "10px 14px 3px", letterSpacing: "0.6px", textTransform: "uppercase" }}>Clients</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "#f5f5f7" }}>
              <i className="ti ti-building-bank" style={{ fontSize: 14, color: T }} aria-hidden="true" />TLC
              <span style={{ background: T, color: "#fff", padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700, marginLeft: "auto" }}>{contacts.length}</span>
            </div>
            {[["cru","ti-clipboard-list","CRU"],["contacts","ti-address-book","Confirmed contacts"],["curative","ti-clipboard-check","Curative list"],["ups","ti-package","UPS tracker"]].map(([id,icon,label]) => (
              <NavItem key={id} icon={icon} label={label} indent active={view === id && !sel} onClick={() => { setView(id); setSel(null); }} />
            ))}
            <div style={{ height: 6 }} />
            <div style={{ fontSize: 10, fontWeight: 500, color: "#3a3a3c", padding: "10px 14px 3px", letterSpacing: "0.6px", textTransform: "uppercase" }}>Add client</div>
            <NavItem icon="ti-plus" label="New client" onClick={() => alert("Multi-client — coming soon")} />
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {sel ? (
            <ContactDetail contact={sel} onBack={() => setSel(null)} onUpdate={handleUpdate} onDelete={handleDelete} />
          ) : view === "dashboard" ? (
            <>
              <Hdr title="Dashboard" />
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
                  <Stat label="Total contacts" value={contacts.length} sub="TLC project" />
                  <Stat label="Confirmed contacts" value={stats.cc} sub="have phone/email" valueColor={T} />
                  <Stat label="Curative items" value={stats.cu} sub="across all records" valueColor={stats.cu ? "#dc2626" : undefined} />
                  <Stat label="UPS shipments" value={stats.up} sub="logged" />
                </div>
                <Card>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 9 }}>Status breakdown — TLC</div>
                  {Object.entries(stats.sc).sort((a, b) => b[1] - a[1]).map(([s, n]) => (
                    <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "0.5px solid #ebebeb", fontSize: 11 }}>
                      <span style={{ color: "#8e8e93" }}>{s}</span><StatusBadge status={s} />
                    </div>
                  ))}
                </Card>
                {contacts.some(c => (c.curative_items || []).length > 0) && (
                  <Card>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 9 }}>Contacts needing curative action</div>
                    {contacts.filter(c => (c.curative_items || []).length > 0).slice(0, 10).map(c => (
                      <div key={c.id} onClick={() => setSel(c)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "0.5px solid #f5f5f7", cursor: "pointer", fontSize: 11 }}>
                        <span style={{ fontWeight: 700, color: T, width: 65, flexShrink: 0 }}>{c.lcid}</span>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                        <span style={{ background: "#fee2e2", color: "#991b1b", padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 500 }}>{(c.curative_items || []).length} item{(c.curative_items || []).length > 1 ? "s" : ""}</span>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            </>
          ) : view === "cru" ? (
            <>
              <Hdr title="CRU" chip={`TLC · ${filtered.length} records`} action={<Btn primary onClick={() => setShowAdd(true)}><i className="ti ti-plus" style={{ fontSize: 11 }} /> Add record</Btn>} />
              <div style={{ display: "flex", gap: 8, padding: "10px 20px", borderBottom: "0.5px solid #f2f2f7", flexShrink: 0 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <i className="ti ti-search" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#aeaeb2", pointerEvents: "none" }} aria-hidden="true" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, LCID, legal…" style={{ width: "100%", padding: "7px 10px 7px 28px", fontSize: 11, border: "0.5px solid #e5e5ea", borderRadius: 8, background: "#f9f9f9", fontFamily: font }} />
                </div>
                <Select value={statusF} onChange={e => setStatusF(e.target.value)} options={allStatuses} />
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, tableLayout: "fixed" }}>
                  <THead cols={[["LCID",65],["Owner name",185],["Tract",68],["Net acres",72],["Status",140],["Last entry",82],["",18]]} />
                  <tbody>
                    {filtered.map(c => (
                      <TRow key={c.id} onClick={() => setSel(c)}>
                        <TD2 style={{ fontWeight: 700, color: T }}>{c.lcid}</TD2>
                        <TD2 style={{ fontWeight: 500 }}>{c.name}</TD2>
                        <TD2 style={{ color: "#8e8e93" }}>{c.tract}</TD2>
                        <TD2 style={{ color: "#8e8e93" }}>{c.net ? parseFloat(c.net).toFixed(3) : "—"}</TD2>
                        <TD2><StatusBadge status={c.status} /></TD2>
                        <TD2 style={{ color: "#aeaeb2", fontSize: 10 }}>{(c.log || [])[0]?.date || "—"}</TD2>
                        <TD2 style={{ color: "#d2d2d7", fontSize: 14 }}>›</TD2>
                      </TRow>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#aeaeb2", fontSize: 11 }}>No records match.</div>}
              </div>
            </>
          ) : view === "contacts" ? (
            <>
              <Hdr title="Confirmed contacts" chip="TLC" action={<Btn sm><i className="ti ti-download" style={{ fontSize: 11 }} /> Export</Btn>} />
              <div style={{ flex: 1, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, tableLayout: "fixed" }}>
                  <THead cols={[["LCID",65],["Name",158],["Phone",112],["Email",138],["Address",165],["Confirmed",76]]} />
                  <tbody>
                    {contacts.map(c => (
                      <TRow key={c.id} onClick={() => setSel(c)}>
                        <TD2 style={{ fontWeight: 700, color: T }}>{c.lcid}</TD2>
                        <TD2 style={{ fontWeight: 500 }}>{c.name}</TD2>
                        <TD2 style={{ color: "#8e8e93" }}>{c.phone || "—"}</TD2>
                        <TD2 style={{ color: T, fontSize: 10 }}>{c.email || "—"}</TD2>
                        <TD2 style={{ color: "#aeaeb2", fontSize: 10 }}>{[c.address, c.city, c.state].filter(Boolean).join(", ") || "—"}</TD2>
                        <TD2><span style={{ background: c.contact_confirmed ? "#d1fae5" : "#fee2e2", color: c.contact_confirmed ? "#065f46" : "#991b1b", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 500 }}>{c.contact_confirmed ? "Yes" : "No"}</span></TD2>
                      </TRow>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : view === "curative" ? (
            <>
              <Hdr title="Curative list" chip="TLC" />
              <div style={{ flex: 1, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, tableLayout: "fixed" }}>
                  <THead cols={[["LCID",65],["Owner",152],["Issue"],["Priority",72],["Date",80]]} />
                  <tbody>
                    {contacts.flatMap(c => (c.curative_items || []).map((cur, ki) => (
                      <TRow key={`${c.id}-${ki}`} onClick={() => setSel(c)}>
                        <TD2 style={{ fontWeight: 700, color: T }}>{c.lcid}</TD2>
                        <TD2 style={{ fontWeight: 500 }}>{c.name}</TD2>
                        <TD2 style={{ color: "#8e8e93" }}>{cur.issue?.slice(0, 100)}</TD2>
                        <TD2><span style={{ background: cur.priority === "high" ? "#fee2e2" : "#fef3c7", color: cur.priority === "high" ? "#991b1b" : "#92400e", padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 500 }}>{cur.priority}</span></TD2>
                        <TD2 style={{ color: "#aeaeb2", fontSize: 10 }}>{cur.date}</TD2>
                      </TRow>
                    )))}
                  </tbody>
                </table>
                {contacts.every(c => !(c.curative_items || []).length) && <div style={{ padding: 20, textAlign: "center", color: "#aeaeb2", fontSize: 11 }}>No curative items.</div>}
              </div>
            </>
          ) : view === "ups" ? (
            <>
              <Hdr title="UPS tracker" chip="TLC" action={<Btn primary onClick={() => alert("Click any contact row to log a shipment")}><i className="ti ti-plus" style={{ fontSize: 11 }} /> Log shipment</Btn>} />
              <div style={{ flex: 1, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, tableLayout: "fixed" }}>
                  <THead cols={[["LCID",65],["Recipient",142],["Tracking #",162],["Notes"],["Date",72],["Status",78]]} />
                  <tbody>
                    {contacts.flatMap(c => (c.ups_shipments || []).map((u, ui) => (
                      <TRow key={`${c.id}-${ui}`} onClick={() => setSel(c)}>
                        <TD2 style={{ fontWeight: 700, color: T }}>{c.lcid}</TD2>
                        <TD2 style={{ fontWeight: 500 }}>{c.name}</TD2>
                        <TD2 style={{ fontFamily: "monospace", fontSize: 10, color: T }}>{u.tracking}</TD2>
                        <TD2 style={{ color: "#8e8e93" }}>{u.notes}</TD2>
                        <TD2 style={{ color: "#aeaeb2", fontSize: 10 }}>{u.date}</TD2>
                        <TD2><span style={{ background: u.status === "Delivered" ? "#d1fae5" : u.status === "RTS" ? "#fee2e2" : "#fef3c7", color: u.status === "Delivered" ? "#065f46" : u.status === "RTS" ? "#991b1b" : "#92400e", padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 500 }}>{u.status}</span></TD2>
                      </TRow>
                    )))}
                  </tbody>
                </table>
                {contacts.every(c => !(c.ups_shipments || []).length) && <div style={{ padding: 20, textAlign: "center", color: "#aeaeb2", fontSize: 11 }}>No UPS shipments.</div>}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}