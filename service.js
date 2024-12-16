const crypto = require('crypto');

const providers = {
    mockEmailProviders1: async (email) => {
        if (Math.random() < 0.7) {
            throw new Error('EmailProvider1 failed');
        }
        return { success: true, provider: 'EmailProvider1' };

    },
    mockEmailProviders2: async (email) => {
        if (Math.random() < 0.3) {
            throw new Error('EmailProvider2 failed');
        }
        return { success: true, provider: 'EmailProvider2' };

    }
}

class EmailService {
    constructor() {
        this.queueSystem = []
        this.rateLimiting = new Map()
        this.mockEmailProviders = providers
        this.mailStatus = new Map()
        this.isQueueProccessing = false
        this.reportSummery = {}
    }

    generateHashMail(email) {
        return crypto.createHash('sha256').update(JSON.stringify(email)).digest('hex');
    }
    checkRateLimit(recipient) {
        // console.log(recipient)
        const lastaReqTime = this.rateLimiting.get(recipient)
        // console.log(Date.now()-lastaReqTime )
        return lastaReqTime && Date.now() - lastaReqTime < 1000
    }

    sendMail(email) {
        const hashMail = this.generateHashMail(email)
        //console.log(this.mailStatus.has(hashMail),this.mailStatus.get(hashMail))
        if (this.mailStatus.has(hashMail) && this.mailStatus.get(hashMail) !== 'Failed') {
            return { hashMail, status: 'Mail already sent or in progress' };
        }
        // console.log(this.checkRateLimit(email.recipient))
        if (this.checkRateLimit(email.recipient)) {
            return { hashMail, status: 'Mail request rate limit exceed. please try again after 1sec!' };
        }
        this.rateLimiting.set(email.recipient, Date.now())
        this.queueSystem.push({ hashMail, email })
        this.mailStatus.set(hashMail, 'Queued')
        this.reportSummery[hashMail] = { recipient: email.recipient, hashMail, status: 'queued', provider: 'none', attempts: 0 }
        if (!this.isQueueProccessing) {
            this.processQueueSystem()
        }
        return { hashMail, status: 'Queued' };
    }

    async processQueueSystem() {
        if (this.isQueueProccessing) return
        this.isQueueProccessing = true
        while (this.queueSystem.length > 0) {
            const { hashMail, email } = this.queueSystem.shift()
            // console.log(email)
            const maxAttempts = 3
            let attempt = 0
            let res = false
            for (let provider in this.mockEmailProviders) {

                while (attempt < maxAttempts) {
                    // console.log(attempt, provider)
                    attempt++
                    try {
                        const result = await this.mockEmailProviders[provider]()
                        // console.log(result)
                        this.mailStatus.set(hashMail, 'Success')
                        this.reportSummery[hashMail] = { recipient: email.recipient, hashMail, status: 'success', provider: result.provider, attempts: attempt }
                        res = result.success
                        break

                    }
                    catch (err) {
                        // console.log(err)
                        const delay = 1000 * 2 ** attempt;
                        await new Promise((resolve) => setTimeout(resolve, delay));
                    }
                }
                if (res) {
                    break
                }
                attempt = 0

            }
            if (!res) {
                this.mailStatus.set(hashMail, 'Failed')
                this.reportSummery[hashMail] = { recipient: email.recipient, hashMail, status: 'failed', provider: 'Both failed', attempts: 6 }
            }


        }
        console.log('proccessing completed')
        this.isQueueProccessing = false
    }
}

module.exports = EmailService