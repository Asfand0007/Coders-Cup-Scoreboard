const puppeteer = require('puppeteer');
const URL= 'https://vjudge.net/contest/587923#rank'

const getData = async () =>{
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

        await page.goto(URL);
        await page.waitForSelector('#contest-rank-table');
    
        const data = await page.evaluate(() => {
            const rows = document.querySelectorAll('#contest-rank-table tbody tr');
            const result = [];
    
            rows.forEach(row => {
                const rank = row.querySelector('td.rank').innerText.trim();
                const teamName = row.querySelector('td.team a').innerText.trim();
                const score = row.querySelector('td.solved span').innerText.trim();
                const problems = [];
                const problemCells = row.querySelectorAll('td.prob');
                // const house= some way to get house of each individual team

                problemCells.forEach(cell => {
                    const accepted = cell.classList.contains('accepted');
                    const failed = cell.classList.contains('failed');
                    time='';

                    let problemStatus = 'Not attempted';
                    if (accepted) {
                        problemStatus = 'Accepted';
                        time = cell.innerText.split('<br>')[0].trim().split('\n')[0].trim();
                    } else if (failed) {
                        problemStatus = 'Failed';
                    }
    
                    problems.push({
                        status: problemStatus,
                        time: time
                    });
                });
    
    
                result.push({ rank, teamName, score,  problems});
                // result.push({ rank, teamName, score, house,  problems});
            });
    
            return result;
        });
        await browser.close();
        return data;
}

const getRanking= async(req,res)=>{
    try {
        data= await getData(); 
        console.log('response sent successfully');
        res.status(200).json(data);
    } catch (e) {
        console.log(e.message);
        res.status(400).json({error: e.message})
    }
}


const getHouseRanking= async (req,res)=>{
    //calculate each house score based on team data
}

module.exports= {getRanking};   


// <tr data-c="587923" data-u="838190" data-team-id="587923-838190" class="this  ">
//   <td class="rank meta">19</td>  
//   <td class="team meta"><div><i class="fa fa-star-o star-team" data-team-id="587923-838190"></i> <img src="https://cravatar.cn/avatar/ce7278e990ee48de3ba7659739effcf4?d=retro" alt="avatar" class="contestant-avatar"><a href="/user/Ayaan_Irfan" title="Ayaan_Irfan Hockers-cp074" target="_blank">Ayaan_Irfan <span style="color:grey">(Hockers-cp074)</span></a></div></td>
//   <td class="solved meta"><span>3</span></td>
//   <td class="penalty meta">
//     <span class="minute">4575</span>
//     <span class="hms">3:04:15:38</span>
//   </td>
//   <td class="prob ">&nbsp;</td>
//   <td class="prob accepted">1:01:06:48<br> <span>(-2)</span>
//   <td class="prob accepted fb">16:56:26<br>&nbsp;</td>
//   <td class="prob failed"> <span>(-2)</span></td>
// </tr>