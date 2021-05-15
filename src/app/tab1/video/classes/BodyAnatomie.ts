import similarity from 'calculate-cosine-similarity';
/**
 * Class to separate a JSON object of Posenet into differents parts of the human body
 * 
 * The leys are:
 * 
 * 0	Nase
 * 1	linkes Auge
 * 2	rechtes Auge
 * 3	linkes Ohr
 * 4	rechtes Ohr
 * 5	linke Schulter
 * 6	rechte Schulter
 * 7	leftElbow
 * 8	rechter Ellbogen
 * 9	linkes Handgelenk
 * 10	rechtes Handgelenk
 * 11	linke Hüfte
 * 12	Rechte Hüfte
 * 13	linkes Knie
 * 14	rechtes Knie
 * 15	linker Knöchel
 * 16	rechter Knöchel
 */
class BodyAnatomie{
    private bodyKeyPoints: JSON;
    //Left arm
    private leftArmKeys = [5,7,9];
    private leftArmVector = [];
    //Right arm
    private rightArmKeys = [6,8,10];
    private rightArmVector = [];
    //Left leg
    private leftLegKeys = [11, 13, 14]
    private leftLegVector = []
    //Right leg
    private rightLegKeys = [12,14,16]
    private rightLegVector = []
    //Posture
    private postureKeys = [5,6,11,12]
    private postureVector = []

    constructor(pose: JSON){
        this.bodyKeyPoints = pose["keypoints"];
        this.postureVector = this.poseToVector(this.bodyKeyPoints, this.postureKeys);
        this.leftArmVector = this.poseToVector(this.bodyKeyPoints, this.leftArmKeys);
        this.rightArmVector = this.poseToVector(this.bodyKeyPoints, this.rightArmKeys);
        this.leftLegVector = this.poseToVector(this.bodyKeyPoints, this.leftLegKeys);
        this.rightLegVector = this.poseToVector(this.bodyKeyPoints, this.rightLegKeys);  
    }
    
    public getPostureVector(){
        return this.postureVector;
    }

    public getLeftArmVector(){
        return this.leftArmVector;
    }

    public getRightArmVector(){
        return this.rightArmVector;
    }

    public getLeftLegVector(){
        return this.leftLegVector;
    }

    public getRightLegVector(){
        return this.rightLegVector;
    }

    /**
     * Calculate the vector a body part from the keys and the pose model
     * @param bodyKeyPoints the keys of the whole human body
     * @param bodyPartKeyPoints the keys that represents a particular body part
     * @returns vector of the body par
     */
    private poseToVector(bodyKeyPoints, bodyPartKeyPoints){
        var vectorPose = [];
        for(let key of bodyPartKeyPoints){
          const position = bodyKeyPoints[key];
          
          const x = position["x"];
          const y = position["y"];
          
          vectorPose.push(x)
          vectorPose.push(y)
    
        }
        return vectorPose
      }
    
   /**
   * Compare to body part vector using the similarity of the cosine and calculate the distance
   * @param pose1 - the body part vector from the user 
   * @param pose2 - the body part vector from the coach
   * @returns - distance between two poses using the cosine simularity
   */
    compareTwoPoses(poseVector1, poseVector2){
     
    let cosineSimilarity = similarity(poseVector1, poseVector2);
    /**
    let distance = 2 * (1 - cosineSimilarity);
    return Math.sqrt(Math.abs(distance)); */
    return cosineSimilarity
  }

}
export {BodyAnatomie};
